import { useTRPC } from "@/trpc/client"
import { useMeetingsFilters } from "../../hooks/use-agents-filters"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CommandSelect } from "./command-select"
import { GeneratedAvatar } from "@/components/generated-avatar"


export const AgentIdFilter = () => {
    const [filters, setFilters] = useMeetingsFilters()
    const trpc = useTRPC()

    const [agentSearch, seAgentSearch] = useState("")
    const { data } = useQuery(trpc.agents.getMany.queryOptions({
        pagesize: 100,
        search: agentSearch
    }))


    return (
        <CommandSelect
            className="h-9"
            placeholder="Agent"
            options={(data?.items ?? []).map((agent) => ({
                id: agent.id,
                value: agent.id,
                children: (
                    <div className="flex items-center gap-x-2 ">
                        <GeneratedAvatar
                            seed={agent.name}
                            variant="bottsNeutral"
                            className="size-4"

                        />
                        {agent.name}
                    </div>
                )
            }))}
            onSearch={seAgentSearch}
            value={filters.agentId ?? ""}
            onSelect={(value) => setFilters({ agentId: value })}
        />
    )
}