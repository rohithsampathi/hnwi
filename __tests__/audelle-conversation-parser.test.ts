import * as secureApiModule from "@/lib/secure-api"
import { rohithAPI } from "@/lib/rohith-api"

describe("Audelle conversation start parser", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("uses top-level conversation_id", async () => {
    const postSpy = jest
      .spyOn(secureApiModule.secureApi, "post")
      .mockResolvedValueOnce({
        conversation_id: "conv-top",
        response: {
          content: "Hello",
        },
      })

    const result = await (rohithAPI as any).createConversationJarvis("Hi", "user-1")

    expect(postSpy).toHaveBeenCalled()
    expect(result.conversationId).toBe("conv-top")
  })

  it("parses wrapped stringified responses", async () => {
    const responsePayload = JSON.stringify({
      conversation_id: "conv-stringified",
      message_id: "msg-stringified",
      response: {
        content: "Hello from wrapped payload",
      },
    })

    jest
      .spyOn(secureApiModule.secureApi, "post")
      .mockResolvedValueOnce(responsePayload)

    const result = await (rohithAPI as any).createConversationJarvis("Hi", "user-2")

    expect(result.conversationId).toBe("conv-stringified")
  })

  it("supports response envelope variants before conversation marker", async () => {
    const responseEnvelope = {
      data: {
        metadata: {
          payload: JSON.stringify({
            data: {
              conversation: {
                id: "conv-nested",
              },
            },
            message_id: "msg-nested",
          }),
        },
      },
    }

    jest
      .spyOn(secureApiModule.secureApi, "post")
      .mockResolvedValueOnce(responseEnvelope)

    const result = await (rohithAPI as any).createConversationJarvis("Hi", "user-3")

    expect(result.conversationId).toBe("conv-nested")
  })

  it("supports nested envelope conversation id", async () => {
    jest
      .spyOn(secureApiModule.secureApi, "post")
      .mockResolvedValueOnce({
        data: {
          response: {
            conversation: {
              id: "conv-envelope",
            },
          },
        },
      })

    const result = await (rohithAPI as any).createConversationJarvis("Hi", "user-4")

    expect(result.conversationId).toBe("conv-envelope")
  })

  it("throws when parser cannot extract conversation id", async () => {
    jest
      .spyOn(secureApiModule.secureApi, "post")
      .mockResolvedValueOnce({ response: { content: "Missing ids" } })

    await expect((rohithAPI as any).createConversationJarvis("Hi", "user-4")).rejects.toThrow(
      /conversation ID/i
    )
  })

  it("supports visualizations with missing ids by generating stable fallbacks", async () => {
    jest
      .spyOn(secureApiModule.secureApi, "post")
      .mockResolvedValueOnce({
        response: {
          conversation_id: "conv-visual",
          response: {
            content: "Here are the visuals",
            visualizations: [
              {
                type: "data_explainer",
                data: { title: "Sources", rows: [[1, "USD"], [2, "AED"]] },
                priority: 1,
              },
              {
                type: "key_metrics",
                id: 9001,
                data: { title: "Metrics" },
                priority: 2,
              },
            ],
          },
          message_id: "msg-visual",
        },
      })

    const result = await (rohithAPI as any).createConversationJarvis("Hi", "user-visual")

    expect(result.conversationId).toBe("conv-visual")
    expect(result.visualizations).toHaveLength(2)

    const generated = result.visualizations[0]
    expect(typeof generated.id).toBe("string")
    expect(generated.id.length).toBeGreaterThan(0)
    expect(generated.id).toContain("data_explainer")
    expect(generated.id).not.toBe("9001")

    const numeric = result.visualizations[1]
    expect(numeric.id).toBe("9001")
  })

  it("extracts AWS-style visualizationCommands graph payloads", async () => {
    jest
      .spyOn(secureApiModule.secureApi, "post")
      .mockResolvedValueOnce({
        data: {
          body: JSON.stringify({
            conversation_id: "conv-aws-graph",
            message_id: "msg-aws-graph",
            response: {
              content: "Here is the graph",
              visualizationCommands: [
                {
                  kind: "chain_network",
                  title: "Route dependency graph",
                  nodes: [
                    { id: "texas", label: "Texas" },
                    { id: "hyderabad", label: "Hyderabad" },
                  ],
                  edges: [
                    { from: "texas", to: "hyderabad" },
                  ],
                },
              ],
            },
          }),
        },
      })

    const result = await (rohithAPI as any).createConversationJarvis("Show graph", "user-aws")

    expect(result.conversationId).toBe("conv-aws-graph")
    expect(result.visualizations).toHaveLength(1)
    expect(result.visualizations[0].type).toBe("chain_network")
    expect(result.visualizations[0].data.nodes).toHaveLength(2)
    expect(result.visualizations[0].data.edges).toHaveLength(1)
  })

  it("extracts graph_payload objects even when the backend omits type", async () => {
    jest
      .spyOn(secureApiModule.secureApi, "post")
      .mockResolvedValueOnce({
        conversation_id: "conv-graph-payload",
        message_id: "msg-graph-payload",
        response: {
          content: "Graph ready",
          graph_payload: JSON.stringify({
            title: "Decision path",
            nodes: [
              { id: "signal", label: "Signal" },
              { id: "memo", label: "Memo" },
            ],
            edges: [
              { from: "signal", to: "memo" },
            ],
          }),
        },
      })

    const result = await (rohithAPI as any).createConversationJarvis("Show graph", "user-graph")

    expect(result.visualizations).toHaveLength(1)
    expect(result.visualizations[0].type).toBe("cascade_graph")
    expect(result.visualizations[0].data.title).toBe("Decision path")
  })

  it("normalizes AWS chart rows into data explainer sections", async () => {
    jest
      .spyOn(secureApiModule.secureApi, "post")
      .mockResolvedValueOnce({
        conversation_id: "conv-chart",
        message_id: "msg-chart",
        response: {
          content: "Chart ready",
          visualization_commands: [
            {
              chartType: "lineChart",
              title: "Lag history",
              rows: [
                { label: "Week 1", value: 12 },
                { label: "Week 2", value: 18 },
              ],
            },
          ],
        },
      })

    const result = await (rohithAPI as any).createConversationJarvis("Show chart", "user-chart")

    expect(result.visualizations).toHaveLength(1)
    expect(result.visualizations[0].type).toBe("line_chart")
    expect(result.visualizations[0].data.sections[0].kind).toBe("line")
    expect(result.visualizations[0].data.sections[0].rows).toHaveLength(2)
  })
})
