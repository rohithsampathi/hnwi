import { resolveDecisionMemoSurfaceData } from '@/lib/decision-memo/resolve-decision-memo-surface-data'

describe('resolveDecisionMemoSurfaceData', () => {
  test('normalizes Kingdom native preview shells instead of returning null', () => {
    const surface = resolveDecisionMemoSurfaceData({
      intakeId: 'fo_audit_ANda3ViU7-QF',
      backendData: {
        success: true,
        status: 'kingdom_native_preview',
        intake_id: 'fo_audit_ANda3ViU7-QF',
        kingdom_native: true,
        answerCount: 0,
        memo: {
          title: 'Kingdom Native Decision Memo Preview',
          executiveSummary: 'The Decision Memo surface runs inside Kingdom.',
          libraryAuthority: 'Granthika / central Mongo / Kingdom native writeback',
          nextStep: 'Keep production env certified.',
        },
      },
    })

    expect(surface).not.toBeNull()
    expect(surface?.memoData.intake_id).toBe('fo_audit_ANda3ViU7-QF')
    expect(surface?.memoData.preview_data.input_snapshot?.backend_incomplete).toBe(true)
    expect(surface?.memoData.preview_data.executive_summary?.headline_metric?.value).toBe('Awaiting completed memo')
    expect(surface?.backendData.resolvedDevelopmentsCount).toBe(0)
  })

  test('keeps completed Kingdom memo payloads on the full report contract', () => {
    const surface = resolveDecisionMemoSurfaceData({
      intakeId: 'fo_audit_ANda3ViU7-QF',
      backendData: {
        success: true,
        status: 'completed',
        intake_id: 'fo_audit_ANda3ViU7-QF',
        preview_data: {
          source_jurisdiction: 'United Kingdom',
          destination_jurisdiction: 'Dubai',
          hnwi_world_count: 2272,
          executive_summary: {
            headline_metric: {
              label: 'Underwritten Annual Return',
              value: '~$0.42M',
              description: '$168K net income + $248K appreciation basis',
            },
          },
        },
        memo_data: {
          title: 'UK/Dubai Completion Stress Memo',
        },
        full_artifact: {
          thesis_summary: 'The house can proceed only after route controls clear.',
          house_grade_memo: {
            verdict: 'PROCEED MODIFIED',
          },
        },
        surfaceIntegrity: {
          status: 'ready',
        },
      },
    })

    expect(surface).not.toBeNull()
    expect(surface?.memoData.intake_id).toBe('fo_audit_ANda3ViU7-QF')
    expect(surface?.memoData.preview_data.input_snapshot?.backend_incomplete).toBeUndefined()
    expect(surface?.memoData.preview_data.executive_summary?.headline_metric?.value).toBe('~$0.42M')
    expect(surface?.memoData.full_artifact?.thesis_summary).toContain('route controls')
    expect(surface?.fullArtifact?.house_grade_memo?.verdict).toBe('PROCEED MODIFIED')
    expect(surface?.developmentsCount).toBe(2272)
  })

  test('resolves compact completed payloads where the artifact only lives on memoData', () => {
    const surface = resolveDecisionMemoSurfaceData({
      intakeId: 'fo_audit_ANda3ViU7-QF',
      backendData: {
        success: true,
        status: 'completed',
        intake_id: 'fo_audit_ANda3ViU7-QF',
        preview_data: {
          source_jurisdiction: 'United Kingdom',
          destination_jurisdiction: 'Dubai',
          executive_summary: {
            headline_metric: {
              label: 'Underwritten Annual Return',
              value: '~$0.42M',
            },
          },
        },
        memo_data: {
          title: 'UK/Dubai Completion Stress Memo',
        },
      },
      fullArtifact: {
        thesis_summary: 'Compact payload artifact',
        house_grade_memo: {
          verdict: 'PROCEED MODIFIED',
        },
      },
    })

    expect(surface).not.toBeNull()
    expect(surface?.memoData.preview_data.executive_summary?.headline_metric?.value).toBe('~$0.42M')
    expect(surface?.memoData.full_artifact?.thesis_summary).toBe('Compact payload artifact')
    expect(surface?.backendData.full_artifact?.thesis_summary).toBe('Compact payload artifact')
  })

  test('does not require duplicate top-level fullArtifact when memoData carries the artifact', () => {
    const surface = resolveDecisionMemoSurfaceData({
      intakeId: 'fo_audit_ANda3ViU7-QF',
      backendData: {
        success: true,
        status: 'completed',
        intake_id: 'fo_audit_ANda3ViU7-QF',
        preview_data: {
          source_jurisdiction: 'United Kingdom',
          destination_jurisdiction: 'Dubai',
          executive_summary: {
            headline_metric: {
              value: '~$0.42M',
            },
          },
        },
        memoData: {
          full_artifact: {
            thesis_summary: 'MemoData-only compact artifact',
            house_grade_memo: {
              verdict: 'PROCEED MODIFIED',
            },
          },
        },
      },
    })

    expect(surface).not.toBeNull()
    expect(surface?.memoData.preview_data.executive_summary?.headline_metric?.value).toBe('~$0.42M')
    expect(surface?.fullArtifact?.thesis_summary).toBe('MemoData-only compact artifact')
    expect(surface?.memoData.full_artifact?.house_grade_memo?.verdict).toBe('PROCEED MODIFIED')
  })

  test('normalizes compact DM64 base stress opportunity projection objects into chart-ready scenarios', () => {
    const surface = resolveDecisionMemoSurfaceData({
      intakeId: 'HC7X4M9Q2R6A8',
      backendData: {
        success: true,
        status: 'completed',
        intake_id: 'HC7X4M9Q2R6A8',
        preview_data: {
          hnwi_world_count: 21,
          wealth_projection_data: {
            starting_value: 6_931_440,
            transaction_value: 6_931_440,
            starting_position: {
              transaction_value: 6_931_440,
              all_in_outlay_sgd: 11_445_790,
              stamp_duty_drag_sgd: 4_514_350,
            },
            cost_of_inaction: {
              year_1: 4_514_350,
              year_5: 4_514_350,
              year_10: 4_514_350,
            },
            probability_weighted: {
              expected_net_worth: 2_417_090,
              if_stay: 0,
              net_benefit: -4_514_350,
              value_creation: -4_514_350,
            },
            scenarios: {
              base: {
                growth_rate: '5.14% break-even CAGR',
                name: 'Release differently',
                probability: 82,
                verdict: 'Proceed Modified',
                year_10_value: 6_931_440,
              },
              stress: {
                growth_rate: 'Negative after duty drag and friction',
                name: 'Proceed before gates',
                probability: 18,
                verdict: 'Hold/Stop',
                year_10_value: 2_417_090,
              },
              opportunity: {
                growth_rate: 'Optionality preserved',
                name: 'Hold or rent-first until evidence clears',
                probability: 55,
                verdict: 'Release later if evidence clears',
                year_10_value: 6_931_440,
              },
            },
          },
        },
      },
    })

    const wealthProjection = surface?.memoData.preview_data.wealth_projection_data

    expect(surface).not.toBeNull()
    expect(Array.isArray(wealthProjection?.scenarios)).toBe(true)
    expect(wealthProjection?.scenarios).toHaveLength(3)
    expect(wealthProjection?.scenarios?.map((scenario: any) => scenario.name)).toEqual([
      'BASE_CASE',
      'STRESS_CASE',
      'OPPORTUNITY_CASE',
    ])
    expect(wealthProjection?.scenarios?.[0].probability).toBeCloseTo(0.82)
    expect(wealthProjection?.scenarios?.[1].year_by_year).toHaveLength(4)
    expect(wealthProjection?.scenarios?.[1].ten_year_outcome.final_value).toBe(2_417_090)
    expect(wealthProjection?.starting_position.total_acquisition_cost).toBe(11_445_790)
    expect(wealthProjection?.starting_position.stamp_duties_paid).toBe(4_514_350)
    expect(wealthProjection?.probability_weighted_outcome.net_benefit_of_move).toBe(-4_514_350)
  })
})
