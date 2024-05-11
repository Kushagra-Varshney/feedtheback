This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication Flow

1. **Authentication Route Setup**
   - Establish the authentication route (`/api/auth/[...nextauth]`).

2. **Configuration Separation**
   - Define all configuration in `Options.ts`.
   - Manage routes in `route.ts` for better code organization.

3. **Credential Provider Configuration**
   - Opt for a Credential Provider in options, specifying the expected credentials.

4. **Custom Authorization Strategy**
   - Implement a custom authorization strategy since credentials are custom.

5. **NextAuth Page Definition**
   - Specify the pages to be handled by NextAuth, using the JWT strategy.

6. **Callback Modification**
   - Modify callbacks to store additional data in session and token, reducing DB calls.

7. **Extension of NextAuth Types**
   - Extend the default types of NextAuth in `next-auth.d.ts` to accommodate customizations.

8. **Next.js Middleware Setup**
   - Configure Next.js middleware to enable authentication and check user authentication status. Route users accordingly.

9. **Session Provider Setup**
   - Set up the session provider to provide authentication context to the entire application.


