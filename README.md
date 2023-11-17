# The Young Lady's Illustrated Primer

This is a prototype for an interactive storybook powered by generative AI. The user can make stories by writing anything in to the prompt window. AI will return a completion, then generate an image for this page of the book. A generated narration can accompany the story as well.

## Running the Illustrated Primer
To run the primer locally you will need to run both the UI and the server. As well as provide your own openai API keys.
1. To run the primer you must have node 18 installed locally.
2. From the root of the project run `pnpm install` to install all dependencies.
3. Navigate to the server directory `cd server`
4. Create a copy of the `.env.example` file named `.env`. `cp .env.example .env`
5. Fill in the missing information for OpenAI organization and OpenAI key
6. Current the primer requires the db to be seeded to start. Do that with `npx prisma db seed`
6. Run the sever with `pnpm run dev`
7. In a different terminal window naviate to the `ui` folder.
8. Run the ui with `pnpm run dev`
9. Navigate to the browser to begin using the primer. 