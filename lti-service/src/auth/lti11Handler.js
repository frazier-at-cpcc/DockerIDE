const crypto = require('crypto');
const { logger } = require('../utils/logger');

class LTI11Handler {
  constructor() {
    this.consumerKey = process.env.LTI_CONSUMER_KEY || 'dockeride-key';
    this.consumerSecret = process.env.LTI_CONSUMER_SECRET || 'dockeride-secret';
  }

  /**
   * Validate LTI 1.1 OAuth signature
   */
  validateRequest(req) {
    const params = { ...req.body };

    // Extract OAuth parameters
    const oauthSignature = params.oauth_signature;
    delete params.oauth_signature;

    // Build base string
    const baseString = this.buildOAuthBaseString(
      req.method,
      this.getFullUrl(req),
      params
    );

    // Calculate signature
    const calculatedSignature = this.calculateSignature(baseString);

    // Compare signatures
    if (oauthSignature !== calculatedSignature) {
      logger.error('LTI 1.1 signature validation failed');
      return false;
    }

    // Validate timestamp (must be within 5 minutes)
    const timestamp = parseInt(params.oauth_timestamp);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      logger.error('LTI 1.1 timestamp expired');
      return false;
    }

    // Validate nonce (should implement nonce storage to prevent replay attacks)
    if (!params.oauth_nonce) {
      logger.error('LTI 1.1 missing nonce');
      return false;
    }

    return true;
  }

  /**
   * Build OAuth base string
   */
  buildOAuthBaseString(method, url, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${this.percentEncode(key)}=${this.percentEncode(params[key])}`)
      .join('&');

    return [
      method.toUpperCase(),
      this.percentEncode(url),
      this.percentEncode(sortedParams)
    ].join('&');
  }

  /**
   * Calculate OAuth signature
   */
  calculateSignature(baseString) {
    const key = `${this.percentEncode(this.consumerSecret)}&`;
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(baseString);
    return hmac.digest('base64');
  }

  /**
   * Percent encode according to OAuth spec
   */
  percentEncode(str) {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A');
  }

  /**
   * Get full URL from request
   */
  getFullUrl(req) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${protocol}://${host}${req.path}`;
  }

  /**
   * Extract user and context from LTI 1.1 parameters
   */
  extractLTIData(params) {
    return {
      user: {
        id: params.user_id,
        name: params.lis_person_name_full ||
              `${params.lis_person_name_given || ''} ${params.lis_person_name_family || ''}`.trim(),
        email: params.lis_person_contact_email_primary,
        roles: (params.roles || '').split(',').map(r => r.trim())
      },
      context: {
        courseId: params.context_id,
        courseName: params.context_title || params.context_label,
        assignmentId: params.resource_link_id,
        assignmentTitle: params.resource_link_title,
        // Custom parameters
        githubRepo: params.custom_github_repo,
        language: params.custom_language || 'base',
        extensions: params.custom_vscode_extensions,
        compilers: params.custom_compilers
      },
      lmsInfo: {
        platform: params.tool_consumer_info_product_family_code,
        version: params.tool_consumer_info_version,
        instanceGuid: params.tool_consumer_instance_guid
      },
      // Grade passback info
      gradeInfo: {
        lisOutcomeServiceUrl: params.lis_outcome_service_url,
        lisResultSourcedid: params.lis_result_sourcedid
      }
    };
  }

  /**
   * Send grade back to LMS (LTI 1.1 Basic Outcomes)
   */
  async sendGrade(gradeInfo, score, comment = '') {
    if (!gradeInfo.lisOutcomeServiceUrl || !gradeInfo.lisResultSourcedid) {
      throw new Error('Grade passback not supported for this launch');
    }

    const messageIdentifier = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
  <imsx_POXHeader>
    <imsx_POXRequestHeaderInfo>
      <imsx_version>V1.0</imsx_version>
      <imsx_messageIdentifier>${messageIdentifier}</imsx_messageIdentifier>
    </imsx_POXRequestHeaderInfo>
  </imsx_POXHeader>
  <imsx_POXBody>
    <replaceResultRequest>
      <resultRecord>
        <sourcedGUID>
          <sourcedId>${gradeInfo.lisResultSourcedid}</sourcedId>
        </sourcedGUID>
        <result>
          <resultScore>
            <language>en</language>
            <textString>${score}</textString>
          </resultScore>
          ${comment ? `<resultData><text>${comment}</text></resultData>` : ''}
        </result>
      </resultRecord>
    </replaceResultRequest>
  </imsx_POXBody>
</imsx_POXEnvelopeRequest>`;

    // Sign the request
    const oauthParams = this.buildOAuthParams();
    const baseString = this.buildOAuthBaseString(
      'POST',
      gradeInfo.lisOutcomeServiceUrl,
      oauthParams
    );
    const signature = this.calculateSignature(baseString);

    // Make request
    const axios = require('axios');
    try {
      const response = await axios.post(
        gradeInfo.lisOutcomeServiceUrl,
        xml,
        {
          headers: {
            'Content-Type': 'application/xml',
            'Authorization': this.buildAuthHeader({ ...oauthParams, oauth_signature: signature })
          }
        }
      );

      logger.info('LTI 1.1 grade sent successfully');
      return response.data;

    } catch (error) {
      logger.error('Failed to send LTI 1.1 grade:', error);
      throw error;
    }
  }

  /**
   * Build OAuth parameters
   */
  buildOAuthParams() {
    return {
      oauth_consumer_key: this.consumerKey,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0'
    };
  }

  /**
   * Build OAuth Authorization header
   */
  buildAuthHeader(params) {
    const authParams = Object.keys(params)
      .filter(key => key.startsWith('oauth_'))
      .map(key => `${key}="${this.percentEncode(params[key])}"`)
      .join(', ');

    return `OAuth ${authParams}`;
  }
}

module.exports = { LTI11Handler };