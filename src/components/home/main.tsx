// React
import { type FC, type FormEvent, useState, useEffect } from 'react'

// UI
import AsideComponent from './aside'
import Avatar from "boring-avatars";
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/20/solid'

// Next Auth
import { useSession } from 'next-auth/react';

// DB
import { api } from '@/utils/api';
import { type Prompt } from '@prisma/client';
import { toast } from 'react-hot-toast';

// Types
interface MainProps {
    chatId: string;
}

const Main: FC<MainProps> = ({
    chatId,
}) => {

    // Session
    const { data: session } = useSession()

    // Messages from DB in state variable to render in UI
    const [messages, setMessages] = useState<Prompt[] | []>([]);

    //Mutations and Queries
    const promptCreation = api.gpt.createChatPrompt.useMutation();
    const getPrompts = api.gpt.getPrompts.useQuery({
        id: chatId,
    });

    // Form textarea state
    const [prompt, setPrompt] = useState<string>("");

    // Refetch chat every time chatId changes
    useEffect(() => {
        if (!chatId) return;
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        toast.promise(
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    getPrompts.refetch()
                        .then((data) => {
                            if (!data) return reject(new Error('No data'))
                            setMessages(data.data as Prompt[])
                            resolve(true)
                        })
                        .catch((err) => {
                            reject(err)
                        })
                }, 1000)
            })
            ,
            {
                loading: 'Loading...',
                success: 'Loaded!',
                error: 'Error loading',
            }
        )
    }, [chatId])


    // Save prompt to DB
    const savePrompt = (type: string, prompt: string) => {
        if (!session) return;
        promptCreation.mutate({
            prompt,
            type,
            chatId,
            userId: session.user.id,
        })
    }

    type gptResponse = {
        message: {
            role: string,
            content: string,
        };
        finish_reason: string,
        index: number,
    }

    // Handle form submit, save user prompt to DB and then ask gpt, then save gpt response in DB 
    // and lastly refetch chat
    const handleData = (e: FormEvent<HTMLElement>) => {
        e.preventDefault();
        if (!prompt) return;
        savePrompt("user", prompt); // Save user prompt to DB
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        toast.promise(
            new Promise((resolve, reject) => {
                // Ask gpt
                fetch("/api/openai/gpt", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messages,
                        prompt,
                    }),
                }).then((res) => {
                    //resolve gpt response
                    resolve(res)
                    return res.json();
                }).then((data) => {
                    // Save gpt response to DB
                    const response = data as gptResponse;
                    if (!response.message) return toast.error("Something went wrong");
                    savePrompt("assistant", response.message.content); // Save gpt response to DB
                    setPrompt(""); // reset prompt input field
                }).then(() => {
                    // Refetch chat
                    setTimeout(() => {
                        getPrompts.refetch()
                            .then((data) => {
                                if (!data) return new Error('No data')
                                setMessages(data.data as Prompt[])
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    }, 300)
                }).catch((err) => reject(err))
            })
            ,
            {
                loading: 'Asking gpt-3.5-turbo...',
                success: 'gpt answered!',
                error: 'Error asking gpt-3.5-turbo',
            }
        )

        return;
    }



    return (
        <main className="flex-1">
            <div className="py-8 xl:py-10">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 xl:grid xl:max-w-5xl xl:grid-cols-3">
                    <div className="xl:col-span-2 xl:border-r xl:border-gray-200 xl:pr-8">
                        <section aria-labelledby="chat-messages">
                            <div>
                                <div className="divide-y divide-gray-200">
                                    <div className="pb-4">
                                        <h2 id="chat-messages" className="text-lg font-medium text-gray-900">
                                            The Zen GPT
                                        </h2>
                                    </div>
                                    <div className="pt-6">
                                        {/* messages feed*/}
                                        <div className="flow-root">
                                            <ul role="list" className="-mb-8">
                                                {messages.map((item, itemIdx) => (
                                                    <li key={`item #${itemIdx}`}>
                                                        <div className="relative pb-8">
                                                            {itemIdx !== messages.length - 1 ? (
                                                                <span
                                                                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                                                    aria-hidden="true"
                                                                />
                                                            ) : null}
                                                            <div className="relative flex items-start space-x-3">
                                                                {
                                                                    item.type === "user" ? (
                                                                        <>
                                                                            <div className="relative">
                                                                                <Avatar
                                                                                    size={40}
                                                                                    name="Nathan Lazo"
                                                                                    variant="beam"
                                                                                    colors={["#711FBB", "#D375FF", "#393434", "#F0F0E5", "#6505BD"]}
                                                                                />
                                                                                <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
                                                                                    <ChatBubbleLeftEllipsisIcon
                                                                                        className="h-5 w-5 text-gray-400"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <div>
                                                                                    <div className="text-sm">
                                                                                        <span className="font-medium text-gray-900">
                                                                                            {session?.user.name}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="mt-2 text-sm text-gray-700">
                                                                                    <p>{item.prompt}</p>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <div className="relative">
                                                                                <Avatar
                                                                                    size={40}
                                                                                    name={item.type}
                                                                                    variant="beam"
                                                                                    colors={["#711FBB", "#D375FF", "#393434", "#F0F0E5", "#6505BD"]}
                                                                                />
                                                                            </div>
                                                                            <div className="min-w-0 flex-1">
                                                                                <div>
                                                                                    <div className="text-sm">
                                                                                        <span className="font-medium text-gray-900">
                                                                                            gpt-3.5-turbo
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="mt-2 text-sm text-gray-700">
                                                                                    <p>{item.prompt}</p>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="mt-6">
                                            <div className="flex space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="relative">
                                                        <Avatar
                                                            size={40}
                                                            name="Nathan Lazo"
                                                            variant="beam"
                                                            colors={["#711FBB", "#D375FF", "#393434", "#F0F0E5", "#6505BD"]}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <form onSubmit={(e) => {
                                                        handleData(e)
                                                    }}>
                                                        <div>
                                                            <label htmlFor="prompt" className="sr-only">
                                                                Prompt
                                                            </label>
                                                            <textarea
                                                                id="prompt"
                                                                name="prompt"
                                                                rows={3}
                                                                className="block w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:py-1.5 sm:text-sm sm:leading-6"
                                                                placeholder="Leave a prompt"
                                                                defaultValue={''}
                                                                value={prompt}
                                                                onChange={(e) => setPrompt(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="mt-6 flex items-center justify-end space-x-4">
                                                            <button
                                                                type="submit"
                                                                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                                                            >
                                                                Ask gpt
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <AsideComponent
                        messages={messages}
                    />
                </div>
            </div>
        </main>
    );
}
export default Main;