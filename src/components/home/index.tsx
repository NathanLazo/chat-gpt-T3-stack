// React
import { useEffect, useState } from 'react'

// UI
import MobileSidebar from './sidebar/mobile'
import DesktopSidebar from './sidebar/desktop'
import TopNavigation from './sidebar/topNav'
import MainComponent from './main'
import { toast } from 'react-hot-toast';

// DB
import { api } from '@/utils/api';
import { type Chat } from '@prisma/client';

// Next auth
import { useSession } from 'next-auth/react';


export default function HomeContainer() {
    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [navigation, setNavigation] = useState<Chat[] | []>([])

    // Session
    const { data: session } = useSession()

    // Mutations and queries
    const allChats = api.gpt.getChats.useQuery({
        id: session?.user.id as string,
    });
    const chatCreation = api.gpt.createChat.useMutation();


    //Render all chats on sidebar
    useEffect(() => {
        if (allChats.data) {
            setNavigation(allChats.data)
        }
    }, [allChats.data])

    // Selected chat
    const [chatId, setChatId] = useState<string>("");

    // Create chat and refetch chats
    const createChat = () => {
        if (!session) return;
        chatCreation.mutate({
            userId: session.user.id,
        })
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        toast.promise(
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    allChats.refetch()
                        .then((data) => {
                            if (!data) return reject(new Error('No data'))
                            setNavigation(data.data as Chat[])
                            resolve(true)
                        })
                        .catch((err) => {
                            console.error(err)
                            reject(err)
                        })
                }, 1000)
            })
            , {
                loading: 'Creating chat...',
                success: 'Chat created!',
                error: 'Error creating chat contact support',
            }
        )
    }

    return (
        <>

            <div className="flex min-h-full">
                {/* Mobile sidebar */}
                <MobileSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    navigation={navigation}
                    createChat={createChat}
                    setChatId={setChatId}
                    chatId={chatId}
                />
                {/* Desktop sidebar */}
                <DesktopSidebar
                    navigation={navigation}
                    createChat={createChat}
                    setChatId={setChatId}
                    chatId={chatId}
                    allChats={allChats}
                />
                <div className="flex w-0 flex-1 flex-col lg:pl-64">
                    <TopNavigation setSidebarOpen={setSidebarOpen} />
                    {chatId !== "" ? <MainComponent
                        chatId={chatId}
                    /> :
                        <div className="flex flex-col items-center justify-center h-full">
                            <h1 className="text-2xl font-bold text-gray-500">Select a chat to start</h1>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}
