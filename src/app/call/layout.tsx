interface props {
    children: React.ReactNode
}

export default async function Layout({
    children
}: props) {
    return (
        <div className="bg-black h-screen">
            {children}
        </div>
    )

}