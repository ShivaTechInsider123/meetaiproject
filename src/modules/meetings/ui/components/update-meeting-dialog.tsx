
import { ResponsiveDialog } from "@/components/responsive-dialog"

import { MeetingsForm } from "./meetings-form"
import { useRouter } from "next/navigation"
import { MeetingOne } from "../../types"


interface UpdateMeetingDialogProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    initialValues: MeetingOne
}
export function UpdateMeetingDialog({ open, onOpenChange, initialValues }: UpdateMeetingDialogProps) {
    const router = useRouter()
    return (
        <ResponsiveDialog
            title="Update Meeting"
            description="Update the meeting details"
            open={open}
            onOpenChange={onOpenChange}
        >
            <MeetingsForm onSuccess={(id) => {
                onOpenChange(false);
            }}
                onCancel={() => onOpenChange(false)}
                initialValues={initialValues}
            />

        </ResponsiveDialog>
    )
}
