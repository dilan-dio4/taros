import React, { createContext, useState } from "react"
import Navigo from 'navigo'

type IAppContext = ReturnType<typeof AppProvider>["value"]

export const AppContext = createContext<IAppContext>({} as IAppContext)

export default function AppProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [activeView, setActiveView] = useState<"home" | "eg">()

    const [router] = useState(() => {
        const _router = new Navigo("/")
        _router.on({
            "/home": () => {
                setActiveView("home")
            },
            "/eg": () => {
                setActiveView("eg")
            }
        })
        _router.resolve()
        return _router
    })


    const value = {
        activeView,
        router,
    } as const;

    return {
        ...(<AppContext.Provider value={value}>{children}</AppContext.Provider>),
        value,
    }
}
