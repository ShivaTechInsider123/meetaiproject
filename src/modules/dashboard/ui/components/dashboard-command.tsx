import { Command, CommandResponsiveDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { Dispatch, SetStateAction } from "react";
interface props {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}
export function DashboardCommand({ open, setOpen }: props) {
    return (
        <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Find a meeting or agent" />
            <CommandList>
                <CommandItem>
                    Test
                </CommandItem>
            </CommandList>


        </CommandResponsiveDialog>
    );
}