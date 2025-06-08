<x-mail::message>
# Welcome, Developer!

Your temporary developer account for **{{ config('app.name') }}** has been successfully created or refreshed.

This account is intended for development and testing purposes. Please remember that these credentials will be reset each time the database migrations are refreshed with seeders, as part of the normal development workflow.

## Your Login Credentials:

<x-mail::panel>
Use the following credentials to log in:

- **Email / Username:** `{{ $username }}`
- **Password:** `{{ $password }}`
</x-mail::panel>

Click the button below to access the application:

<x-mail::button :url="config('app.url') . '/login'">
Login to Application
</x-mail::button>

If you encounter any issues, please ensure your local development environment is correctly configured.

Best regards,<br>
The {{ config('app.name') }} Team
</x-mail::message>
