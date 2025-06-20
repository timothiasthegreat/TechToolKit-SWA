# TechToolKit-SWA

*This project is a work in progress and is not yet complete. Contributions are welcome!*

TechToolKit-SWA is a companion project to [timothiasthegreat/TechToolKit-API](https://github.com/timothiasthegreat/TechToolKit-API). This repository serves as the front-end implementation for the TechToolKit platform, providing users with a streamlined interface to interact with tools hosted on the backend API.

## Features

- **Tool Listing**: Displays a list of available tools retrieved from the backend API.
- **Tag Management**: Allows users to set tags for tools via a dynamic form.
- **File Upload**: Enables users to upload new tools to the backend API.
- **SAS URL Generation**: Provides users with a secure SAS URL for downloading tools.
- **Azure Integration**: Built using Azure Static Web Apps and Azure Functions for seamless cloud deployment.

## Project Structure

- **`src/`**: Contains the front-end HTML, CSS, and JavaScript files.
  - `index.html`: Main page displaying available tools.
  - `upload.html`: Page for uploading new tools. (Future implementation)
  - `staticwebapp.config.json`: Configuration file for Azure Static Web Apps.
- **`api/`**: Contains Azure Functions for handling API requests.
  - `ListTools.js`: Retrieves the list of tools from the backend API.
  - `SetTags.js`: Updates tags for tools.
  - `NewTool.js`: Handles file uploads and forwards them to the backend API. (Future implementation)

## Security

This project uses environment variables to manage sensitive information such as API keys and URLs. Ensure that these variables are set up correctly in your Azure environment to maintain security and functionality.  By using API proxying, the project avoids exposing sensitive API keys directly in the front-end code.

Authentication is configured for the Static Web App, allowing only authenticated users to access the tool management features. This is done through Azure Static Web Apps' built-in authentication and authorization features.  You will need to invite users to your Azure Static Web App to allow them access.

### Roles (Future Implementation)

- **reader**: Can view the list of tools and download them.
- **contributor**: Can view, download, and upload new tools.

## Setup Instructions

1. Clone this repository:

   ```bash
   git clone https://github.com/timothiasthegreat/TechToolKit-SWA.git
   ```

2. Deploy the project to Azure Static Web Apps:

   - Follow the [Azure SWA Quickstart Guide](https://docs.microsoft.com/en-us/azure/static-web-apps/getting-started?tabs=vanilla-javascript) to set up your Azure environment.
   - Ensure you have the Azure Functions Core Tools installed for local development.

3. Set up environment variables:

- LIST_TOOLS_URL: URL for retrieving the list of tools.
- LIST_TOOLS_API_KEY: API key for accessing the tool listing endpoint.
- SET_TAGS_URL: URL for setting tags on tools.
- SET_TAGS_API_KEY: API key for accessing the tag management endpoint.
- NEW_TOOL_URL: URL for uploading new tools.
- NEW_TOOL_API_KEY: API key for accessing the file upload endpoint.

Related Repository
This project works in conjunction with the backend API repository: timothiasthegreat/TechToolKit-API.

License
This project is licensed under the MIT License. See the LICENSE file for details.
