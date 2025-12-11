# Enhanced Assessment Report Backend Architecture

## Executive Summary
Transform the assessment report from text-heavy to insight-rich visual analytics with peer comparisons, missed opportunities, and actionable intelligence.

---

## Table of Contents
1. [Core Report Components](#core-report-components)
2. [Spider Graph Analytics](#spider-graph-analytics)
3. [Missed Opportunities Engine](#missed-opportunities-engine)
4. [Peer Comparison System](#peer-comparison-system)
5. [Visual Analytics Suite](#visual-analytics-suite)
6. [KGv2 Intelligence Integration](#kgv2-intelligence-integration)
7. [API Endpoints](#api-endpoints)
8. [Data Models](#data-models)

---

## Core Report Components

### 1. Executive Dashboard
```python
{
  "executive_summary": {
    "tier": "BUILDER",
    "percentile": 85,  # Top 15% of HNWIs
    "net_worth_estimate": "$1.5M - $3M",
    "peer_group_size": 2847,
    "opportunities_accessible": 427,
    "opportunities_missed": 68,
    "optimization_potential": 0.34  # 34% improvement possible
  }
}
```

### 2. Multi-Dimensional Performance Metrics
```python
{
  "performance_dimensions": {
    "risk_appetite": 0.72,
    "geographic_diversification": 0.45,
    "sector_expertise": 0.88,
    "time_horizon_alignment": 0.91,
    "liquidity_management": 0.55,
    "tax_efficiency": 0.38,
    "network_leverage": 0.29,
    "market_timing": 0.67
  }
}
```

---

## Spider Graph Analytics

### Peer Comparison Spider Graph
```python
def generate_spider_graph_data(user_id: str, session_id: str):
    """
    Generate multi-dimensional comparison against peer group
    """

    # Get user's calibration
    user_profile = get_user_calibration(user_id)
    tier = user_profile['tier']

    # Define dimensions for HNWI success
    dimensions = [
        "Risk Management",
        "Geographic Reach",
        "Sector Diversification",
        "Network Utilization",
        "Timing Precision",
        "Tax Optimization",
        "Liquidity Balance",
        "Sophistication Level"
    ]

    # Calculate user scores
    user_scores = {
        "Risk Management": calculate_risk_score(user_profile),
        "Geographic Reach": calculate_geographic_score(user_profile),
        "Sector Diversification": calculate_sector_score(user_profile),
        "Network Utilization": calculate_network_score(user_profile),
        "Timing Precision": calculate_timing_score(user_profile),
        "Tax Optimization": calculate_tax_score(user_profile),
        "Liquidity Balance": calculate_liquidity_score(user_profile),
        "Sophistication Level": user_profile['sophistication']
    }

    # Get peer averages
    peer_averages = {
        "Risk Management": get_peer_average(tier, "risk"),
        "Geographic Reach": get_peer_average(tier, "geographic"),
        "Sector Diversification": get_peer_average(tier, "sector"),
        "Network Utilization": get_peer_average(tier, "network"),
        "Timing Precision": get_peer_average(tier, "timing"),
        "Tax Optimization": get_peer_average(tier, "tax"),
        "Liquidity Balance": get_peer_average(tier, "liquidity"),
        "Sophistication Level": get_peer_average(tier, "sophistication")
    }

    # Get top performer benchmarks
    top_10_percent = {
        dim: get_top_performer_score(tier, dim, percentile=90)
        for dim in dimensions
    }

    return {
        "dimensions": dimensions,
        "user_scores": [user_scores[d] for d in dimensions],
        "peer_average": [peer_averages[d] for d in dimensions],
        "top_performers": [top_10_percent[d] for d in dimensions],
        "improvement_areas": identify_improvement_areas(user_scores, peer_averages)
    }
```

### Opportunity Alignment Spider Graph
```python
def generate_opportunity_spider(user_id: str):
    """
    Show alignment across different opportunity types
    """

    categories = [
        "Real Estate",
        "Private Equity",
        "Venture Capital",
        "Public Markets",
        "Alternative Assets",
        "Cryptocurrency",
        "Art & Collectibles",
        "Commodities"
    ]

    user_alignment = calculate_category_alignments(user_id)
    opportunities_available = get_category_counts()
    opportunities_captured = get_user_category_matches(user_id)

    return {
        "categories": categories,
        "alignment_score": user_alignment,
        "capture_rate": [
            opportunities_captured[cat] / opportunities_available[cat]
            for cat in categories
        ],
        "peer_capture_rate": get_peer_capture_rates(user_id)
    }
```

---

## Missed Opportunities Engine

### What You Missed Section
```python
def analyze_missed_opportunities(user_id: str, session_id: str):
    """
    Identify high-value opportunities that peers took but user didn't
    """

    user_profile = get_user_calibration(user_id)
    user_answers = get_session_answers(session_id)

    # Get all questions and user's choices
    missed_opps = []

    for question in get_assessment_questions():
        user_choice = user_answers.get(question.id)

        # Analyze what successful peers chose
        peer_choices = db.query("""
            SELECT choice_id, COUNT(*) as count,
                   AVG(post_assessment_performance) as avg_performance
            FROM assessment_answers
            WHERE question_id = %s
              AND user_tier = %s
              AND post_assessment_performance > 0.7
            GROUP BY choice_id
            ORDER BY avg_performance DESC
        """, question.id, user_profile['tier'])

        # Find missed high-value choices
        for peer_choice in peer_choices:
            if peer_choice.choice_id != user_choice:
                # Get opportunities linked to this choice
                linked_opps = get_opportunities_for_choice(peer_choice.choice_id)

                for opp in linked_opps:
                    if opp['performance_history']['roi'] > 0.15:  # 15% ROI threshold
                        missed_opps.append({
                            "opportunity": opp,
                            "question": question.title,
                            "your_choice": get_choice_text(user_choice),
                            "winning_choice": get_choice_text(peer_choice.choice_id),
                            "peer_adoption": peer_choice.count,
                            "avg_roi": opp['performance_history']['roi'],
                            "category": opp['category'],
                            "missed_value": estimate_missed_value(opp, user_profile)
                        })

    # Sort by missed value and return top 10
    missed_opps.sort(key=lambda x: x['missed_value'], reverse=True)

    return {
        "top_missed": missed_opps[:10],
        "total_missed_value": sum(o['missed_value'] for o in missed_opps),
        "missed_by_category": group_by_category(missed_opps),
        "peer_success_stories": get_peer_success_stories(missed_opps[:3])
    }
```

### Celebrity Opportunities Filter
```python
def get_celebrity_opportunities(user_tier: str):
    """
    Find opportunities that top performers in tier are taking
    """

    # Get top 5% performers in tier
    top_performers = db.query("""
        SELECT DISTINCT user_id
        FROM user_performance
        WHERE tier = %s
          AND performance_percentile >= 95
        ORDER BY total_returns DESC
        LIMIT 100
    """, user_tier)

    # Find their common opportunities
    celebrity_opps = db.query("""
        SELECT o.*,
               COUNT(DISTINCT uo.user_id) as adoption_count,
               AVG(uo.roi) as avg_roi,
               ARRAY_AGG(DISTINCT uo.user_id) as adopters
        FROM opportunities o
        JOIN user_opportunities uo ON o.id = uo.opportunity_id
        WHERE uo.user_id IN %s
          AND uo.roi > 0.2  # 20% ROI minimum
        GROUP BY o.id
        HAVING COUNT(DISTINCT uo.user_id) > 10  # At least 10 top performers
        ORDER BY adoption_count DESC, avg_roi DESC
        LIMIT 20
    """, top_performers)

    return celebrity_opps
```

---

## Peer Comparison System

### Peer Cohort Analysis
```python
def generate_peer_comparison(user_id: str):
    """
    Comprehensive peer comparison analytics
    """

    user = get_user_profile(user_id)

    # Define peer cohort
    peers = db.query("""
        SELECT * FROM users
        WHERE tier = %s
          AND ABS(net_worth - %s) / net_worth < 0.3  # Within 30% net worth
          AND ABS(age - %s) < 10  # Within 10 years age
          AND geographic_region = %s
        LIMIT 1000
    """, user.tier, user.net_worth, user.age, user.region)

    comparison = {
        "cohort_size": len(peers),
        "your_percentile": calculate_percentile(user, peers),

        "performance_metrics": {
            "roi": {
                "you": user.avg_roi,
                "peer_median": calculate_median([p.avg_roi for p in peers]),
                "peer_top_quartile": calculate_percentile([p.avg_roi for p in peers], 75),
                "peer_top_decile": calculate_percentile([p.avg_roi for p in peers], 90)
            },
            "opportunities_captured": {
                "you": user.opportunities_count,
                "peer_median": calculate_median([p.opportunities_count for p in peers]),
                "peer_top_quartile": calculate_percentile([p.opportunities_count for p in peers], 75)
            },
            "diversification_score": {
                "you": calculate_diversification(user),
                "peer_median": calculate_median([calculate_diversification(p) for p in peers])
            }
        },

        "behavioral_comparison": {
            "avg_response_time": {
                "you": user.avg_response_time,
                "peers": calculate_median([p.avg_response_time for p in peers])
            },
            "decision_confidence": {
                "you": calculate_confidence(user),
                "peers": calculate_median([calculate_confidence(p) for p in peers])
            }
        }
    }

    return comparison
```

---

## Visual Analytics Suite

### 1. Opportunity Flow Sankey Diagram
```python
def generate_sankey_data(user_id: str):
    """
    Show flow from assessment choices to opportunity outcomes
    """

    return {
        "nodes": [
            # Questions
            {"id": "q1", "label": "Investment Philosophy"},
            {"id": "q2", "label": "Risk Tolerance"},
            {"id": "q3", "label": "Geographic Preference"},

            # Categories
            {"id": "real_estate", "label": "Real Estate"},
            {"id": "private_equity", "label": "Private Equity"},
            {"id": "venture", "label": "Venture Capital"},

            # Outcomes
            {"id": "captured", "label": "Opportunities Captured"},
            {"id": "missed", "label": "Opportunities Missed"},
            {"id": "not_aligned", "label": "Not Aligned"}
        ],
        "links": calculate_flow_weights(user_id)
    }
```

### 2. Performance Timeline
```python
def generate_performance_timeline(user_id: str):
    """
    Show projected performance based on current trajectory
    """

    current_profile = get_user_profile(user_id)
    similar_users = get_similar_historical_users(current_profile)

    timeline = []
    for year in range(1, 11):  # 10 year projection
        performance = predict_performance(current_profile, similar_users, year)
        timeline.append({
            "year": year,
            "projected_roi": performance['roi'],
            "confidence_interval": performance['confidence'],
            "peer_benchmark": get_peer_benchmark(current_profile.tier, year),
            "opportunities_available": estimate_opportunities(year)
        })

    return timeline
```

### 3. Geographic Heat Map Data
```python
def generate_heatmap_data(user_id: str):
    """
    Show geographic distribution of opportunities and alignment
    """

    user_profile = get_user_profile(user_id)

    regions = {}
    for region in GLOBAL_REGIONS:
        opportunities = get_region_opportunities(region)
        alignment = calculate_region_alignment(user_profile, region)

        regions[region] = {
            "opportunity_count": len(opportunities),
            "avg_roi": calculate_avg_roi(opportunities),
            "alignment_score": alignment,
            "peer_activity": get_peer_activity(user_profile.tier, region),
            "recommended": alignment > 0.7
        }

    return regions
```

---

## KGv2 Intelligence Integration

### Deep Insights Generation
```python
def generate_kgv2_insights(user_id: str, session_id: str):
    """
    Extract deep insights from KGv2 knowledge base
    """

    profile = get_user_profile(user_id)
    answers = get_session_answers(session_id)

    insights = []

    # Pattern matching against successful HNWIs
    historical_matches = kg.query("""
        MATCH (u:User)-[:SIMILAR_TO]->(h:HistoricalHNWI)
        WHERE u.id = $user_id
        AND h.success_score > 0.8
        RETURN h.strategies, h.mistakes_avoided, h.key_decisions
        ORDER BY similarity_score DESC
        LIMIT 10
    """, user_id=user_id)

    for match in historical_matches:
        insights.append({
            "type": "historical_pattern",
            "insight": f"Your profile matches {match.name} who achieved {match.roi}% returns",
            "actionable_advice": match.key_strategies,
            "pitfalls_to_avoid": match.mistakes_avoided
        })

    # Opportunity timing insights
    timing_insights = kg.query("""
        MATCH (o:Opportunity)-[:BEST_TIME]->(t:TimePeriod)
        WHERE o.category IN $user_categories
        AND t.start_date > current_date
        RETURN o, t
        ORDER BY o.expected_roi DESC
        LIMIT 5
    """, user_categories=profile.preferred_categories)

    for timing in timing_insights:
        insights.append({
            "type": "timing_alert",
            "insight": f"{timing.o.title} optimal entry in {timing.t.months} months",
            "expected_roi": timing.o.expected_roi,
            "confidence": timing.confidence
        })

    # Network effect opportunities
    network_insights = kg.query("""
        MATCH (u:User)-[:COULD_CONNECT]->(p:Peer)-[:INVESTED_IN]->(o:Opportunity)
        WHERE u.id = $user_id
        AND o.minimum_investment < $capacity
        AND o.roi > 0.15
        RETURN p, o, COUNT(*) as peer_count
        ORDER BY peer_count DESC
        LIMIT 5
    """, user_id=user_id, capacity=profile.investment_capacity)

    return {
        "strategic_insights": insights[:10],
        "timing_alerts": [i for i in insights if i['type'] == 'timing_alert'],
        "network_opportunities": [i for i in insights if i['type'] == 'network'],
        "historical_patterns": [i for i in insights if i['type'] == 'historical_pattern']
    }
```

---

## API Endpoints

### Enhanced Report Endpoint
```python
@app.get("/api/assessment/report/{session_id}/enhanced")
async def get_enhanced_report(session_id: str):
    """
    Get complete enhanced assessment report with all analytics
    """

    result = get_assessment_result(session_id)
    user_id = result['user_id']

    report = {
        "session_id": session_id,
        "user_id": user_id,
        "generated_at": datetime.utcnow(),

        # Core metrics
        "executive_summary": generate_executive_summary(user_id, session_id),

        # Spider graphs data
        "spider_graphs": {
            "peer_comparison": generate_spider_graph_data(user_id, session_id),
            "opportunity_alignment": generate_opportunity_spider(user_id)
        },

        # Missed opportunities
        "missed_opportunities": analyze_missed_opportunities(user_id, session_id),
        "celebrity_opportunities": get_celebrity_opportunities(result['tier']),

        # Peer comparisons
        "peer_analysis": generate_peer_comparison(user_id),

        # Visual analytics
        "visualizations": {
            "sankey": generate_sankey_data(user_id),
            "timeline": generate_performance_timeline(user_id),
            "heatmap": generate_heatmap_data(user_id)
        },

        # KGv2 insights
        "intelligence": generate_kgv2_insights(user_id, session_id),

        # Actionable recommendations
        "recommendations": generate_recommendations(user_id, session_id)
    }

    # Cache for 24 hours
    cache.set(f"enhanced_report:{session_id}", report, ttl=86400)

    return report
```

### Peer Comparison Endpoint
```python
@app.get("/api/assessment/peer-comparison/{user_id}")
async def get_peer_comparison(
    user_id: str,
    cohort_size: int = 100,
    time_range: str = "1Y"
):
    """
    Get detailed peer comparison analytics
    """

    return {
        "user_id": user_id,
        "cohort": define_peer_cohort(user_id, cohort_size),
        "performance_comparison": compare_performance(user_id, time_range),
        "opportunity_comparison": compare_opportunities(user_id),
        "behavioral_comparison": compare_behaviors(user_id),
        "percentile_rankings": calculate_all_percentiles(user_id)
    }
```

---

## Data Models

### Enhanced Report Model
```python
class EnhancedAssessmentReport(BaseModel):
    session_id: str
    user_id: str
    generated_at: datetime

    # Executive metrics
    tier: str
    percentile: float
    optimization_potential: float

    # Spider graph data
    spider_dimensions: List[str]
    user_scores: List[float]
    peer_averages: List[float]
    top_performer_scores: List[float]

    # Missed opportunities
    missed_opportunities: List[MissedOpportunity]
    total_missed_value: float

    # Peer comparison
    peer_cohort_size: int
    peer_percentile: float
    performance_vs_peers: Dict[str, float]

    # Visual data
    sankey_data: Dict
    timeline_data: List[TimelinePoint]
    heatmap_data: Dict[str, RegionData]

    # Insights
    strategic_insights: List[Insight]
    timing_alerts: List[TimingAlert]
    recommendations: List[Recommendation]

class MissedOpportunity(BaseModel):
    opportunity_id: str
    title: str
    category: str
    missed_value: float
    peer_adoption_rate: float
    roi: float
    reason_missed: str
    action_required: str

class PeerComparison(BaseModel):
    metric: str
    your_value: float
    peer_median: float
    peer_top_quartile: float
    peer_top_decile: float
    percentile: float
    improvement_potential: float
```

---

## Implementation Priority

### Phase 1: Core Analytics (Week 1)
1. Spider graph data generation
2. Missed opportunities analysis
3. Basic peer comparison

### Phase 2: Visual Data (Week 2)
1. Sankey diagram data
2. Performance timeline
3. Geographic heatmap

### Phase 3: Intelligence Layer (Week 3)
1. KGv2 pattern matching
2. Celebrity opportunities
3. Timing insights

### Phase 4: Optimization (Week 4)
1. Caching strategy
2. Performance optimization
3. Real-time updates

---

## Testing Strategy

```python
def test_enhanced_report():
    """
    Comprehensive test suite for enhanced report
    """

    # Create test session
    session = create_test_session()

    # Generate report
    report = get_enhanced_report(session.id)

    # Validate structure
    assert "spider_graphs" in report
    assert "missed_opportunities" in report
    assert len(report["missed_opportunities"]["top_missed"]) == 10

    # Validate calculations
    assert 0 <= report["executive_summary"]["percentile"] <= 100
    assert len(report["spider_graphs"]["peer_comparison"]["dimensions"]) == 8

    # Validate insights
    assert len(report["intelligence"]["strategic_insights"]) > 0

    print("✅ All tests passed")
```

---

This enhanced assessment report backend provides:

1. **Visual Analytics** - Spider graphs, sankey diagrams, timelines
2. **Peer Intelligence** - Deep comparison with similar HNWIs
3. **Missed Opportunities** - What successful peers did differently
4. **Celebrity Tracking** - What top performers are doing
5. **KGv2 Insights** - Pattern matching and predictive analytics
6. **Actionable Intelligence** - Not just data, but what to do next

The focus is on **valuable visual insights** rather than text, with emphasis on **peer comparison** and **missed opportunities** that HNWIs care about.