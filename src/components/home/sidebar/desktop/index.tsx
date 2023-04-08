import React from 'react'


import Image from 'next/image'
import TheZenLogo from '@/../public/images/the-zen.png'
import type { FC } from 'react';
import { type Chat } from '@prisma/client';
import { api } from '@/utils/api';
import { toast } from 'react-hot-toast';
import { type UseTRPCQueryResult } from '@trpc/react-query/shared';

interface indexProps {
    navigation: Chat[]
    createChat: () => void
    setChatId: React.Dispatch<React.SetStateAction<string>>
    chatId: string
    allChats: UseTRPCQueryResult<Chat[], unknown>
}

const index: FC<indexProps> = ({
    navigation,
    createChat,
    setChatId,
    chatId,
    allChats,
}) => {

    const deleteChat = api.gpt.deleteChat.useMutation()

    return (
        <>
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex min-h-0 flex-1 flex-col">
                    <div className="flex h-16 flex-shrink-0 items-center bg-gray-900 px-4">
                        <Image src={TheZenLogo} alt="The Zen Logo" width={45} height={45} />
                    </div>
                    <div className="flex flex-1 flex-col overflow-y-auto bg-gray-800">
                        <nav className="flex-1 px-2 py-4">
                            <div className="space-y-1">
                                <button
                                    onClick={createChat}
                                    className={'text-gray-300 w-full hover:bg-gray-700 hover:text-white group flex items-center rounded-md px-2 py-2 text-sm font-medium'}
                                >
                                    + Create Chat
                                </button>
                                {navigation.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setChatId(item.id)}
                                        className={
                                            chatId === item.id
                                                ? 'text-gray-300 justify-between w-full bg-gray-700 hover:bg-gray-900 hover:text-white group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                                                : 'text-gray-300 justify-between w-full hover:bg-gray-700 hover:text-white group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                                        }
                                    >
                                        {item.id}
                                        <button
                                            onClick={() => {
                                                deleteChat.mutate({ id: item.id })
                                                toast.success('Chat deleted')
                                                setTimeout(() => {
                                                    allChats.refetch().catch((err) => console.error(err))
                                                }, 1000)
                                                setChatId('')
                                            }}
                                            className='hover:bg-gray-500 px-2 py-1 rounded-full'
                                        >
                                            x
                                        </button>
                                    </button>
                                ))}
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}
export default index;
