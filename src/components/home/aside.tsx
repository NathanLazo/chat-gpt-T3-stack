import React from 'react'
import {
    CalendarIcon,
    ChatBubbleLeftEllipsisIcon,
    LockOpenIcon,

} from '@heroicons/react/20/solid';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { type Prompt } from '@prisma/client';
interface AsideProps {
    messages: [] | Prompt[];
}

const AsideComponent: React.FC<AsideProps> = ({
    messages
}) => {
    // Date from the first message
    const createdAtDate = new Date(messages[0]?.createdAt || "");

    // Get the user session
    const { data: session } = useSession();

    return (
        <aside className="hidden xl:block xl:pl-8">
            <h2 className="sr-only">Details</h2>
            <div className="space-y-5">
                <div className="flex items-center space-x-2">
                    <LockOpenIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                    <span className="text-sm font-medium text-green-700">License paid</span>
                </div>
                <div className="flex items-center space-x-2">
                    <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    <span className="text-sm font-medium text-gray-900">{messages.length} messages</span>
                </div>
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    <span className="text-sm font-medium text-gray-900">
                        Created on {` ${createdAtDate.toLocaleDateString()} at ${createdAtDate.toLocaleTimeString()}`}
                    </span>
                </div>
            </div>
            <div className="mt-6 space-y-8 border-t border-gray-200 py-6">
                <div>
                    <h2 className="text-sm font-medium text-gray-500">Account</h2>
                    <ul role="list" className="mt-3 space-y-3">
                        <li className="flex justify-start">
                            <a href="#" className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <Image src={session?.user.image || ""} alt="User Image" width={20} height={20} className='rounded-full cursor-pointer' />
                                </div>
                                <div className="text-sm font-medium text-gray-900">{session?.user.name}</div>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
    )
}

export default AsideComponent
