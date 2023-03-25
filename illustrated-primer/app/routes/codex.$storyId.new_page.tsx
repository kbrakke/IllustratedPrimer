import { Form, useActionData } from "@remix-run/react";
import { ActionArgs, json } from "@remix-run/node";
import pino from "pino";
import { askOpenAI } from "~/models/openai.server";

const logger = pino();

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;


export async function action({ request }: ActionArgs) {
  logger.info(request);
  logger.info('Fetching from Curie...');
  const form = await request.formData();
  // const completion = askOpenAI(form.get('prompt') as string);
  const completion = "This is a Debug Completion";
  return json({ completion });
}

export default function Page() {
  const data = useActionData();
  return (
    <>
      <Form className="bg-base-300 rounded-box border-8" method="post">
        <label>
          What story will we tell today?
          <input type="text" name="prompt" className={inputClassName} />
        </label>
        <img className='object-contain hover:object-cover h-512 w-512' src='https://cataas.com/cat?h=512' />
        <div className="bg-base-300 rounded-box border-8">
          <p>{data ? data.completion : 'Waiting for response...'}</p>
        </div>
      </Form>
    </>
  )
}