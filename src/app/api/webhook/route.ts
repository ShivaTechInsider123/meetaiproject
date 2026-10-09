import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    CallEndedEvent,
    CallTranscriptionReadyEvent,
    CallRecordingReadyEvent,
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
    MessageNewEvent,
} from "@stream-io/node-sdk";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { inngest } from "@/inngest/client";
import OpenAI from "openai";
import { generatedAvatarUri } from "@/lib/avatar";
import { streamChat } from "@/lib/stream-chat";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openAiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
})


export async function POST(req: NextRequest) {
    console.log("======================================");
    console.log("📩 STREAM WEBHOOK RECEIVED");
    console.log("======================================");

    const signature = req.headers.get("x-signature");

    if (!signature) {
        console.log("❌ Missing signature");

        return NextResponse.json(
            { error: "Missing signature" },
            { status: 400 }
        );
    }

    const body = await req.arrayBuffer();
    const rawBody = Buffer.from(body);

    console.log("📦 Raw webhook body received");
    console.log("📦 Body size:", rawBody.length);

    let payload: unknown;

    try {
        payload = streamVideo.verifyAndParseWebhook(
            rawBody,
            signature
        );

        console.log("✅ Webhook signature verified");
        console.log(
            "📨 EVENT TYPE:",
            (payload as Record<string, unknown>).type
        );
    } catch (error) {
        console.error("❌ WEBHOOK VERIFICATION FAILED");
        console.error(error);

        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
        );
    }

    // -----------------------------------------
    // 5. Get event type
    // -----------------------------------------

    const eventType = (
        payload as Record<string, unknown>
    )?.type;

    console.log("📨 EVENT TYPE:", eventType);

    // =========================================
    // CALL SESSION STARTED
    // =========================================

    if (eventType === "call.session_started") {
        console.log("");
        console.log("======================================");
        console.log("🚀 CALL SESSION STARTED");
        console.log("======================================");

        try {
            const event =
                payload as CallSessionStartedEvent;

            console.log(
                "📞 Call CID:",
                event.call_cid
            );

            console.log(
                "📞 Call custom data:",
                event.call.custom
            );

            // -----------------------------------------
            // Get meeting ID
            // -----------------------------------------

            const meetingId =
                event.call.custom?.meetingId;

            console.log(
                "🆔 Meeting ID:",
                meetingId
            );

            if (!meetingId) {
                console.log(
                    "❌ Missing meetingId in call.custom"
                );

                return NextResponse.json(
                    {
                        error: "Missing meetingId",
                    },
                    {
                        status: 400,
                    }
                );
            }

            // -----------------------------------------
            // Find meeting
            // -----------------------------------------

            console.log(
                "🔍 Looking for meeting in database..."
            );

            const [existingMeeting] = await db
                .select()
                .from(meetings)
                .where(
                    and(
                        eq(
                            meetings.id,
                            meetingId
                        ),
                        not(
                            eq(
                                meetings.status,
                                "completed"
                            )
                        ),
                        not(
                            eq(
                                meetings.status,
                                "active"
                            )
                        ),
                        not(
                            eq(
                                meetings.status,
                                "cancelled"
                            )
                        ),
                        not(
                            eq(
                                meetings.status,
                                "processing"
                            )
                        )
                    )
                );

            console.log(
                "📋 Meeting found:",
                !!existingMeeting
            );

            if (!existingMeeting) {
                console.log(
                    "❌ Meeting not found or already processed"
                );

                return NextResponse.json(
                    {
                        error: "Meeting not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            console.log(
                "✅ Meeting found:",
                existingMeeting.id
            );

            console.log(
                "🤖 Meeting agent ID:",
                existingMeeting.agentId
            );

            // -----------------------------------------
            // Update meeting status
            // -----------------------------------------

            console.log(
                "🔄 Updating meeting status to active..."
            );

            await db
                .update(meetings)
                .set({
                    status: "active",
                    startedAt: new Date(),
                })
                .where(
                    eq(
                        meetings.id,
                        existingMeeting.id
                    )
                );

            console.log(
                "✅ Meeting status updated to active"
            );

            // -----------------------------------------
            // Find agent
            // -----------------------------------------

            console.log(
                "🔍 Looking for agent in database..."
            );

            const [existingAgent] = await db
                .select()
                .from(agents)
                .where(
                    eq(
                        agents.id,
                        existingMeeting.agentId
                    )
                );

            console.log(
                "🤖 Agent found:",
                !!existingAgent
            );

            if (!existingAgent) {
                console.log(
                    "❌ Agent not found in database"
                );

                return NextResponse.json(
                    {
                        error: "Agent not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            console.log(
                "======================================"
            );

            console.log(
                "🤖 AGENT INFORMATION"
            );

            console.log(
                "======================================"
            );

            console.log(
                "Agent ID:",
                existingAgent.id
            );

            console.log(
                "Agent name:",
                existingAgent.name
            );

            console.log(
                "Agent instructions:",
                existingAgent.instructions
            );

            console.log(
                "======================================"
            );

            // -----------------------------------------
            // Create Stream call
            // -----------------------------------------

            console.log(
                "📞 Creating Stream call object..."
            );

            const call = streamVideo.video.call(
                "default",
                meetingId
            );

            console.log(
                "✅ Stream call object created"
            );

            console.log(
                "📞 Call type: default"
            );

            console.log(
                "📞 Call ID:",
                meetingId
            );

            // -----------------------------------------
            // Connect OpenAI agent
            // -----------------------------------------

            console.log(
                "======================================"
            );

            console.log(
                "🤖 CONNECTING OPENAI AGENT..."
            );

            console.log(
                "======================================"
            );

            console.log(
                "Agent user ID:",
                existingAgent.id
            );

            console.log(
                "OpenAI API key exists:",
                !!process.env.OPENAI_API_KEY
            );

            if (!process.env.OPENAI_API_KEY) {
                console.log(
                    "❌ OPENAI_API_KEY is missing"
                );

                return NextResponse.json(
                    {
                        error:
                            "OPENAI_API_KEY is missing",
                    },
                    {
                        status: 500,
                    }
                );
            }

            let realtimeClient;

            try {
                realtimeClient =
                    await streamVideo.video.connectOpenAi(
                        {
                            call,
                            openAiApiKey:
                                process.env
                                    .OPENAI_API_KEY!,
                            agentUserId:
                                existingAgent.id,
                        }
                    );


                console.log(
                    "======================================"
                );

                console.log(
                    "✅ OPENAI AGENT CONNECTED"
                );

                console.log(
                    "======================================"
                );
            } catch (error) {
                console.error(
                    "======================================"
                );

                console.error(
                    "❌ FAILED TO CONNECT OPENAI AGENT"
                );

                console.error(
                    "======================================"
                );

                console.error(
                    "Error:",
                    error
                );

                if (error instanceof Error) {
                    console.error(
                        "Error message:",
                        error.message
                    );

                    console.error(
                        "Error stack:",
                        error.stack
                    );
                }

                return NextResponse.json(
                    {
                        error:
                            "Failed to connect OpenAI agent",
                    },
                    {
                        status: 500,
                    }
                );
            }

            // -----------------------------------------
            // Update OpenAI Realtime session
            // -----------------------------------------

            console.log(
                "🧠 Updating OpenAI agent session..."
            );

            try {
                realtimeClient.updateSession({
                    instructions:
                        existingAgent.instructions,
                    turn_detection: {
                        type: "semantic_vad",
                    },

                    input_audio_transcription: {
                        model: "gpt-4o-transcribe",
                    },

                    input_audio_noise_reduction: {
                        type: "near_field",
                    },
                });


                console.log(
                    "✅ Agent session updated successfully"
                );
            } catch (error) {
                console.error(
                    "❌ Failed to update agent session:",
                    error
                );

                return NextResponse.json(
                    {
                        error:
                            "Failed to update agent session",
                    },
                    {
                        status: 500,
                    }
                );
            }

            console.log(
                "======================================"
            );

            console.log(
                "🎉 AGENT SETUP COMPLETED"
            );

            console.log(
                "The AI agent should now be in the call."
            );

            console.log(
                "======================================"
            );
        } catch (error) {
            console.error(
                "======================================"
            );

            console.error(
                "❌ ERROR IN call.session_started"
            );

            console.error(
                "======================================"
            );

            console.error(error);

            if (error instanceof Error) {
                console.error(
                    "Message:",
                    error.message
                );

                console.error(
                    "Stack:",
                    error.stack
                );
            }

            return NextResponse.json(
                {
                    error:
                        "Failed to process call.session_started",
                },
                {
                    status: 500,
                }
            );
        }
    }

    // =========================================
    // CALL SESSION PARTICIPANT LEFT
    // =========================================

    else if (
        eventType ===
        "call.session_participant_left"
    ) {
        console.log(
            "👋 CALL SESSION PARTICIPANT LEFT"
        );

        try {
            const event =
                payload as CallSessionParticipantLeftEvent;

            console.log(
                "📞 Call CID:",
                event.call_cid
            );

            const meetingId =
                event.call_cid.split(":")[1];

            console.log(
                "🆔 Meeting ID:",
                meetingId
            );

            if (!meetingId) {
                console.log(
                    "❌ Missing meetingId"
                );

                return NextResponse.json(
                    {
                        error:
                            "Missing meetingId",
                    },
                    {
                        status: 400,
                    }
                );
            }

            const call =
                streamVideo.video.call(
                    "default",
                    meetingId
                );

            console.log(
                "📞 Ending call..."
            );

            await call.end();

            console.log(
                "✅ Call ended"
            );
        } catch (error) {
            console.error(
                "❌ Error handling participant left:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to handle participant left",
                },
                {
                    status: 500,
                }
            );
        }
    }

    // =========================================
    // CALL SESSION ENDED
    // =========================================

    else if (
        eventType === "call.session_ended"
    ) {
        console.log(
            "🔴 CALL SESSION ENDED"
        );

        try {
            const event =
                payload as CallEndedEvent;

            console.log(
                "📞 Call CID:",
                event.call_cid
            );

            console.log(
                "📞 Call custom:",
                event.call.custom
            );

            const meetingId =
                event.call.custom?.meetingId;

            console.log(
                "🆔 Meeting ID:",
                meetingId
            );

            if (!meetingId) {
                console.log(
                    "❌ Missing meetingId"
                );

                return NextResponse.json(
                    {
                        error:
                            "Missing meetingId",
                    },
                    {
                        status: 400,
                    }
                );
            }

            await db
                .update(meetings)
                .set({
                    status: "processing",
                    endedAt: new Date(),
                })
                .where(
                    and(
                        eq(
                            meetings.id,
                            meetingId
                        ),
                        eq(
                            meetings.status,
                            "active"
                        )
                    )
                );

            console.log(
                "✅ Meeting status changed to processing"
            );
        } catch (error) {
            console.error(
                "❌ Error handling call.session_ended:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to handle call.session_ended",
                },
                {
                    status: 500,
                }
            );
        }
    }

    // =========================================
    // CALL TRANSCRIPTION READY
    // =========================================

    else if (
        eventType ===
        "call.transcription_ready"
    ) {
        console.log(
            "📝 CALL TRANSCRIPTION READY"
        );

        try {
            const event =
                payload as CallTranscriptionReadyEvent;

            console.log(
                "📞 Call CID:",
                event.call_cid
            );

            const meetingId =
                event.call_cid.split(":")[1];

            console.log(
                "🆔 Meeting ID:",
                meetingId
            );

            if (!meetingId) {
                console.log(
                    "❌ Missing meetingId"
                );

                return NextResponse.json(
                    {
                        error:
                            "Missing meetingId",
                    },
                    {
                        status: 400,
                    }
                );
            }

            console.log(
                "📄 Transcript URL:",
                event.call_transcription.url
            );

            const [updatedMeeting] =
                await db
                    .update(meetings)
                    .set({
                        transcriptUrl:
                            event.call_transcription
                                .url,
                    })
                    .where(
                        eq(
                            meetings.id,
                            meetingId
                        )
                    )
                    .returning();

            if (!updatedMeeting) {
                console.log(
                    "❌ Meeting not found"
                );

                return NextResponse.json(
                    {
                        error:
                            "Meeting not found",
                    },
                    {
                        status: 404,
                    }
                );
            }

            console.log(
                "✅ Transcript URL saved"
            );

            // -----------------------------------------
            // Send event to Inngest
            // -----------------------------------------

            console.log(
                "📤 Sending meetings/processing to Inngest..."
            );

            await inngest.send({
                name: "meetings/processing",
                data: {
                    meetingId:
                        updatedMeeting.id,
                    transcriptUrl:
                        updatedMeeting
                            .transcriptUrl,
                },
            });

            console.log(
                "✅ Inngest event sent"
            );
        } catch (error) {
            console.error(
                "❌ Error handling transcription:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to handle transcription",
                },
                {
                    status: 500,
                }
            );
        }
    }

    // =========================================
    // CALL RECORDING READY
    // =========================================

    else if (
        eventType ===
        "call.recording_ready"
    ) {
        console.log(
            "🎥 CALL RECORDING READY"
        );

        try {
            const event =
                payload as CallRecordingReadyEvent;

            console.log(
                "📞 Call CID:",
                event.call_cid
            );

            const meetingId =
                event.call_cid.split(":")[1];

            console.log(
                "🆔 Meeting ID:",
                meetingId
            );

            if (!meetingId) {
                console.log(
                    "❌ Missing meetingId"
                );

                return NextResponse.json(
                    {
                        error:
                            "Missing meetingId",
                    },
                    {
                        status: 400,
                    }
                );
            }

            console.log(
                "🎥 Recording URL:",
                event.call_recording.url
            );

            await db
                .update(meetings)
                .set({
                    recordingUrl:
                        event.call_recording
                            .url,
                })
                .where(
                    eq(
                        meetings.id,
                        meetingId
                    )
                );

            console.log(
                "✅ Recording URL saved"
            );
        } catch (error) {
            console.error(
                "❌ Error handling recording:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Failed to handle recording",
                },
                {
                    status: 500,
                }
            );
        }
    } else if (eventType === "message.new") {
        console.log("reached")
        const event = payload as MessageNewEvent
        const userId = event.message?.user.id
        const channelId = event.channel_id
        const text = event.message?.text

        if (!userId || !channelId || !text) {
            return NextResponse.json(
                {
                    error: "Missing required fields"
                }, {
                status: 400
            }
            )
        }

        const [existingMeeting] = await db
            .select()
            .from(meetings)
            .where(and(
                eq(meetings.id, channelId),
                eq(meetings.status, "completed")
            ))

        if (!existingMeeting) {
            return NextResponse.json(
                {
                    error: "Meeting not found"
                }, {
                status: 404
            }
            )
        }

        const [existingAgent] = await db
            .select().from(agents).where(eq(agents.id, existingMeeting.agentId))

        if (!existingAgent) {
            return NextResponse.json(
                {
                    error: "Agent not found"
                }, {
                status: 404
            }
            )
        }


        if (userId !== existingAgent.id) {
            const instructions = `
      You are an AI assistant helping the user revisit a recently completed meeting.
      Below is a summary of the meeting, generated from the transcript:
      
      ${existingMeeting.summary}
      
      The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:
      
      ${existingAgent.instructions}
      
      The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
      Always base your responses on the meeting summary above.
      
      You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.
      
      If the summary does not contain enough information to answer a question, politely let the user know.
      
      Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.
      `;

            const channel = streamChat.channel("messaging", channelId);
            await channel.watch();

            const previousMessages = channel.state.messages
                .slice(-5)
                .filter((msg) => msg.text && msg.text.trim() !== "")
                .map<ChatCompletionMessageParam>((message) => ({
                    role: message.user?.id === existingAgent.id ? "assistant" : "user",
                    content: message.text || "",
                }));

            const GPTResponse = await openAiClient.chat.completions.create({
                messages: [
                    { role: "system", content: instructions },
                    ...previousMessages,
                    { role: "user", content: text },
                ],
                model: "gpt-4o",
            });

            const GPTResponseText = GPTResponse.choices[0].message.content;

            if (!GPTResponseText) {
                return NextResponse.json(
                    { error: "No response from GPT" },
                    { status: 400 }
                );
            }

            const avatarUrl = generatedAvatarUri({
                seed: existingAgent.name,
                variant: "initials",
            });

            streamChat.upsertUser({
                id: existingAgent.id,
                name: existingAgent.name,
                image: avatarUrl,
            });

            channel.sendMessage({
                text: GPTResponseText,
                user: {
                    id: existingAgent.id,
                    name: existingAgent.name,
                    image: avatarUrl,
                },
            });
        }

    }

    // =========================================
    // UNKNOWN EVENT
    // =========================================

    else {
        console.log(
            "ℹ️ Unhandled Stream event:",
            eventType
        );
    }

    // =========================================
    // FINAL RESPONSE
    // =========================================

    console.log(
        "✅ Webhook processed successfully"
    );

    console.log(
        "======================================"
    );

    return NextResponse.json({
        status: "ok",
    });
}