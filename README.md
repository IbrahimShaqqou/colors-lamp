# COLORS

COLORS is a small LAMP web application. A user can log in, add colors, and search their saved colors.

Live site: https://colors.zooprep.com

## Technologies

- Ubuntu Linux
- Apache
- MySQL
- PHP
- HTML and JavaScript

## Project structure

```text
colors-lamp/
|-- api/          PHP API endpoints
|-- database/     MySQL schema
|-- public/       Browser files
|-- scripts/      Deployment and test scripts
|-- LICENSE.md
|-- README.md
```

## Setup

Use an Ubuntu server with root or sudo access.

```bash
git clone https://github.com/IbrahimShaqqou/colors-lamp.git
cd colors-lamp
sudo ./scripts/deploy.sh
```

The deployment script installs the LAMP packages, creates the database, creates a random application database password, and copies the site into Apache's web root. The generated password stays on the server and is not stored in this repository.

Create a login for the application:

```sql
USE COP4331;
INSERT INTO Users (FirstName, LastName, Login, Password)
VALUES ('First', 'Last', 'your-login', MD5('choose-a-password'));
```

Open the server IP address or configured domain in a browser.

## API

The application sends JSON POST requests to these endpoints:

- `LAMPAPI/Login.php`
- `LAMPAPI/AddColor.php`
- `LAMPAPI/SearchColors.php`

To run the API smoke test, provide an existing login through environment variables:

```bash
export COLORS_TEST_LOGIN='your-login'
export COLORS_TEST_PASSWORD='your-password'
./scripts/test-api.sh https://your-domain.example
```

## Assumptions and limitations

- The deployment script targets Ubuntu.
- Password hashing uses MD5 to match the lab specification. It should not be used in a production application.
- The API accepts JSON POST requests only.
- Login state is stored in the browser and is not a full session system.

## AI usage

I used AI to help organize the repository, review the code, write setup documentation, and troubleshoot deployment. I reviewed and tested the final result.

