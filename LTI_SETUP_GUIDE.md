# LTI Setup Guide for Instructors

This guide helps instructors integrate DockerIDE with their Learning Management System (LMS).

## Table of Contents
- [LTI 1.1 Setup (Legacy)](#lti-11-setup-legacy)
- [LTI 1.3 Setup (Modern)](#lti-13-setup-modern)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

---

## Determining Your LTI Version

### LTI 1.1 (Legacy)
Use if your LMS is:
- Canvas (older versions)
- Blackboard Learn (9.x)
- Moodle (< 3.10)
- Sakai
- Other older LMS platforms

### LTI 1.3 (Modern)
Use if your LMS is:
- Canvas (current versions)
- Blackboard Learn (Ultra, SaaS)
- Moodle (3.10+)
- Brightspace (D2L)
- Schoology

---

## LTI 1.1 Setup (Legacy)

### Step 1: Get Credentials from DockerIDE Admin

Contact your DockerIDE administrator for:
- **Consumer Key**: e.g., `dockeride-key`
- **Shared Secret**: e.g., `dockeride-secret-abc123`
- **Launch URL**: e.g., `https://dockeride.youruniversity.edu/lti/launch`

### Step 2: Configure in Your LMS

#### General Configuration
1. Navigate to External Tools/LTI Tools settings
2. Add new LTI tool with these settings:
   - **Name**: DockerIDE
   - **Consumer Key**: [from Step 1]
   - **Shared Secret**: [from Step 1]
   - **Launch URL**: [from Step 1]
   - **Privacy Level**: Public (or send name, email, role)

#### Custom Parameters

Add these custom parameters (prefix with `custom_` for LTI 1.1):

**Required**:
```
custom_language=python
```

**Optional**:
```
custom_github_repo=https://github.com/yourusername/assignment-repo
custom_vscode_extensions=ms-python.python,ms-python.vscode-pylance
custom_compilers=gcc,g++
```

#### Grade Passback
To enable automatic grade submission:
1. Enable "Accept grades from the tool" or "Outcomes Service"
2. Set the assignment to accept scores (0-100 scale)

### Step 3: Add to Assignment

1. Create a new assignment in your course
2. In assignment settings, select "External Tool"
3. Choose "DockerIDE" from the list
4. Save the assignment

---

## LTI 1.3 Setup (Modern)

### Step 1: Register DockerIDE in Your LMS

You'll need from your DockerIDE admin:
- **Tool URL**: `https://dockeride.youruniversity.edu`
- **Login/OIDC URL**: `https://dockeride.youruniversity.edu/lti/login`
- **Launch URL**: `https://dockeride.youruniversity.edu/lti/launch`
- **Public JWK URL**: `https://dockeride.youruniversity.edu/lti/jwks`
- **Domain**: `dockeride.youruniversity.edu`

### Step 2: Configure Platform Settings

Your LMS will provide:
- **Platform Issuer/URL**: e.g., `https://canvas.university.edu`
- **Client ID**: e.g., `125900000000000001`
- **Deployment ID**: e.g., `1`
- **Keyset URL**: e.g., `https://canvas.university.edu/api/lti/security/jwks`
- **Auth Token URL**: e.g., `https://canvas.university.edu/login/oauth2/token`
- **Auth Login URL**: e.g., `https://canvas.university.edu/api/lti/authorize_redirect`

Send these to your DockerIDE administrator to complete the setup.

### Step 3: Configure Tool Placement

**Scopes Required**:
- `https://purl.imsglobal.org/spec/lti-ags/scope/lineitem` (for grade passback)
- `https://purl.imsglobal.org/spec/lti-ags/scope/score` (for grade passback)
- `https://purl.imsglobal.org/spec/lti-nrp/scope/contextmembership.readonly` (optional)

**Placements**:
- Assignment/Link Selection
- Course Navigation (optional)

### Step 4: Custom Parameters

Add parameters without the `custom_` prefix:

**Required**:
```
language=python
```

**Using LMS Variables**:
```
assignment_id=$Canvas.assignment.id
user_id=$Canvas.user.id
course_id=$Canvas.course.id
```

**Optional**:
```
github_repo=https://github.com/yourusername/assignment-repo
vscode_extensions=ms-python.python,ms-python.vscode-pylance
```

---

## Platform-Specific Instructions

### Canvas

#### LTI 1.1
1. Go to **Settings** → **Apps** → **View App Configurations**
2. Click **+ App**
3. Configuration Type: **By URL** or **Manual Entry**
4. Fill in:
   - Name: `DockerIDE`
   - Consumer Key: [provided]
   - Shared Secret: [provided]
   - Launch URL: [provided]
5. Click **Submit**

#### LTI 1.3
1. Go to **Settings** → **Apps** → **View App Configurations**
2. Click **+ App**
3. Configuration Type: **By Client ID** or **Paste JSON**
4. Enter Client ID or paste configuration JSON
5. Click **Submit**

**Custom Parameters** (per assignment):
```
language=python
assignment_id=$Canvas.assignment.id
github_repo=https://github.com/username/repo
```

### Moodle

#### LTI 1.1
1. **Site Administration** → **Plugins** → **Activity Modules** → **External Tool** → **Manage Tools**
2. Click **Configure a tool manually**
3. Fill in:
   - Tool name: `DockerIDE`
   - Tool URL: [provided]
   - Consumer key: [provided]
   - Shared secret: [provided]
   - Default launch container: New window
4. Save changes

#### LTI 1.3
1. **Site Administration** → **Plugins** → **Activity Modules** → **External Tool** → **Manage Tools**
2. Click **Configure a tool manually**
3. Fill in:
   - Tool name: `DockerIDE`
   - Tool URL: [provided]
   - LTI version: LTI 1.3
   - Public key type: Keyset URL
   - Public keyset: [provided]
   - Initiate login URL: [provided]
   - Redirection URI(s): [provided]
4. Save changes

**Custom Parameters** (in activity settings):
```
language=python
github_repo=https://github.com/username/repo
```

### Blackboard Learn

#### LTI 1.1
1. **System Admin** → **Integrations** → **LTI Tool Providers**
2. Click **Register Provider Domain**
3. Fill in:
   - Provider Domain: `dockeride.youruniversity.edu`
   - Provider Domain Status: Approved
   - Default Configuration: Set globally
   - Tool Provider Key: [provided]
   - Tool Provider Secret: [provided]
4. Submit

#### Adding to Course:
1. In course, **Content** → **Build Content** → **Web Link**
2. Name: Assignment name
3. URL: DockerIDE launch URL
4. Check "This link is to a Tool Provider"
5. Enable grading if desired

### Brightspace (D2L)

#### LTI 1.3
1. **Admin Tools** → **External Learning Tools**
2. Click **New Link**
3. Fill in:
   - Name: `DockerIDE`
   - URL: [launch URL]
   - Type: LTI 1.3
   - Key: [client ID]
4. Configure extensions and custom parameters
5. Save

---

## Language Configuration Examples

### Python Data Science Assignment
```
language=python
github_repo=https://github.com/course/data-science-lab
vscode_extensions=ms-python.python,ms-toolsai.jupyter
```

### Java Spring Boot Project
```
language=java
github_repo=https://github.com/course/spring-boot-starter
vscode_extensions=redhat.java,vscjava.vscode-spring-boot-dashboard
```

### C++ Systems Programming
```
language=cpp
github_repo=https://github.com/course/systems-programming
vscode_extensions=ms-vscode.cpptools,ms-vscode.cmake-tools
compilers=gcc,gdb,valgrind
```

### SQL Database Assignment
```
language=sql
github_repo=https://github.com/course/database-queries
vscode_extensions=mtxr.sqltools,mtxr.sqltools-driver-pg
```

### MongoDB/NoSQL Assignment
```
language=mongodb
github_repo=https://github.com/course/nosql-assignment
vscode_extensions=mongodb.mongodb-vscode
```

### Full-Stack JavaScript
```
language=javascript
github_repo=https://github.com/course/fullstack-app
vscode_extensions=dbaeumer.vscode-eslint,esbenp.prettier-vscode
```

---

## Testing Your Setup

### Quick Test
1. Create a test assignment with DockerIDE
2. Set language parameter: `language=python`
3. Launch as a student
4. You should see VS Code Server in your browser
5. Verify the Python environment is available

### Test Checklist
- [ ] LTI launch works (no authentication errors)
- [ ] Student sees VS Code Server
- [ ] Correct language environment is loaded
- [ ] GitHub repository is cloned (if specified)
- [ ] VS Code extensions are installed
- [ ] Grade passback works (submit a test grade)

### Common Launch Issues

**Error: "Invalid signature"**
- Check consumer key/secret match exactly
- Verify launch URL is correct
- Check for trailing slashes in URLs

**Error: "Tool not configured"**
- Ensure tool is activated in your LMS
- Check placement settings
- Verify course/account level permissions

**Error: "Workspace creation failed"**
- Check DockerIDE service status
- Verify language parameter is valid
- Contact DockerIDE administrator

---

## Grade Passback

### LTI 1.1
Grades are sent as decimal values (0.0 to 1.0):
- DockerIDE score of 85 → LMS receives 0.85
- LMS typically displays as percentage or points

### LTI 1.3
Grades use Assignment and Grade Services (AGS):
- Scores sent as points (0-100)
- Comments included with grade
- Supports partial credit

### Triggering Grade Passback
Grades can be sent:
1. **Automatically**: When student completes assignment
2. **Via API**: Instructor or automated grading system calls grade endpoint
3. **Manually**: Through DockerIDE admin interface

---

## Security Best Practices

1. **Use HTTPS**: Always use secure URLs for production
2. **Rotate Secrets**: Change shared secrets periodically
3. **Limit Permissions**: Grant minimum required LTI scopes
4. **Monitor Access**: Review tool access logs regularly
5. **Student Privacy**: Configure appropriate privacy settings

---

## Advanced Configuration

### Custom Docker Image per Course
```
language=python-cs101
github_repo=https://github.com/university/cs101-template
```

Then configure workspace manager to map `python-cs101` to your custom image.

### Multiple GitHub Repos
```
github_repo=https://github.com/course/starter-code
github_branch=assignment-3
```

### Resource Limits
Contact your administrator to set per-course resource limits:
- CPU: 0.5 to 2 cores
- Memory: 1GB to 4GB
- Storage: 5GB to 10GB
- Session timeout: 2 to 8 hours

---

## Support

### For Instructors
- Check [LANGUAGES.md](LANGUAGES.md) for language-specific details
- Review [README.md](README.md) for system overview
- Contact your DockerIDE administrator

### For Students
Direct students to access their workspace through:
1. Course assignment page
2. Click DockerIDE link
3. Wait for environment to load
4. Start coding!

### Getting Help
- **Technical Issues**: Contact your IT/LMS support team
- **DockerIDE Issues**: Contact your DockerIDE administrator
- **Documentation**: Check [docs.dockeride.edu](https://docs.dockeride.edu)

---

## Appendix: Parameter Reference

### Supported Languages
| Language | Parameter Value | Image |
|----------|----------------|-------|
| JavaScript | `javascript`, `js`, `nodejs` | `dockeride/nodejs` |
| TypeScript | `typescript`, `ts` | `dockeride/nodejs` |
| Python | `python` | `dockeride/python` |
| Java | `java` | `dockeride/java` |
| C++ | `cpp`, `c++`, `c` | `dockeride/cpp` |
| SQL | `sql`, `mysql`, `postgresql`, `sqlite` | `dockeride/sql` |
| MongoDB/NoSQL | `mongodb`, `mongo`, `nosql` | `dockeride/sql` |
| General Database | `database` | `dockeride/sql` |

### LMS Variable Mapping

#### Canvas
```
$Canvas.user.id → user_id
$Canvas.course.id → course_id
$Canvas.assignment.id → assignment_id
$Canvas.user.loginId → user_login
```

#### Moodle
```
$User.id → user_id
$Context.id → course_id
$ResourceLink.id → assignment_id
```

#### Blackboard
```
$User.id → user_id
$CourseSection.sourcedId → course_id
$ResourceLink.id → assignment_id
```