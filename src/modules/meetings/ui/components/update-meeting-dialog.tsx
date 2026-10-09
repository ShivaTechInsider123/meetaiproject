
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { MeetingsForm } from "./meetings-form"
import { MeetingOne } from "../../types"


interface UpdateMeetingDialogProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    initialValues: MeetingOne
}
export function UpdateMeetingDialog({ open, onOpenChange, initialValues }: UpdateMeetingDialogProps) {
    return (
        <ResponsiveDialog
            title="Update Meeting"
            description="Update the meeting details"
            open={open}
            onOpenChange={onOpenChange}
        >
            <MeetingsForm
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
                initialValues={initialValues}
            />

        </ResponsiveDialog>
    )
}
