"use client"
import { GeneratedAvatar } from "@/components/generated-avatar";
import { CommandResponsiveDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
interface props {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}
export function DashboardCommand({ open, setOpen }: props) {

    const router = useRouter()
    const [search, setSearch] = useState("")


    const trpc = useTRPC()

    const meetings = useQuery(trpc.meetings.getMany.queryOptions({
        search,
        pagesize: 100
    }))


    const agents = useQuery(trpc.agents.getMany.queryOptions({
        search,
        pagesize: 100
    }))


    return (
        <CommandResponsiveDialog shouldFilter={true} open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Find a meeting or agent..."
                value={search}
                onValueChange={(value) => setSearch(value)}
            />
            <CommandList>
                <CommandGroup heading="Meetings">
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No meetings found
                        </span>
                    </CommandEmpty>
                    {
                        meetings.data?.items.map((meeting) => (
                            <CommandItem
                                key={meeting.id}
                                onSelect={() => {
                                    setOpen(false)
                                    router.push(`/meetings/${meeting.id}`)
                                }}
                            >
                                {meeting.name}
                            </CommandItem>
                        ))
                    }

                </CommandGroup>
                <CommandGroup heading="Agents">
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No agents found
                        </span>
                    </CommandEmpty>
                    {
                        agents.data?.items.map((agent) => (
                            <CommandItem
                                key={agent.id}
                                onSelect={() => {
                                    setOpen(false)
                                    router.push(`/agents/${agent.id}`)
                                }}
                            >
                                <GeneratedAvatar
                                    seed={agent.name}
                                    variant="botttsNeutral"
                                    className="size-5"
                                />
                                {agent.name}
                            </CommandItem>
                        ))
                    }

                </CommandGroup>
            </CommandList>


        </CommandResponsiveDialog>
    );
}