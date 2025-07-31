// Quick test script to verify form submissions
const testExpressInterest = async () => {
  console.log("Testing Express Interest Form...");
  
  try {
    const response = await fetch("https://formspree.io/f/xldgwozd", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        opportunityTitle: "Test Real Estate Opportunity",
        userName: "John Doe",
        userId: "user123",
        userEmail: "john.doe@example.com",
        opportunityId: "opp456",
        opportunityType: "Real Estate",
        opportunityValue: "$2.5M",
        region: "Europe",
        source: "Privé Exchange",
        timestamp: new Date().toISOString(),
        _subject: "Express Interest: Test Real Estate Opportunity",
        message: "User John Doe (john.doe@example.com) has expressed interest in the investment opportunity: Test Real Estate Opportunity. Source: Privé Exchange. Details: Type: Real Estate, Value: $2.5M, Region: Europe"
      }),
    });
    
    const data = await response.text();
    console.log("Express Interest Response:", response.status, data);
    
    if (response.ok) {
      console.log("✅ Express Interest form submission successful");
    } else {
      console.log("❌ Express Interest form failed");
    }
  } catch (error) {
    console.error("❌ Express Interest test failed:", error);
  }
};

const testTalkToConcierge = async () => {
  console.log("Testing Talk to Concierge Form...");
  
  try {
    const response = await fetch("https://formspree.io/f/xwpvjjpz", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        eventName: "Exclusive Wine Tasting in Napa Valley",
        userName: "Jane Smith",
        userId: "user789",
        userEmail: "jane.smith@example.com",
        eventId: "event123",
        eventCategory: "Wine & Spirits",
        eventLocation: "Napa Valley, California",
        eventVenue: "Private Estate Winery",
        eventDate: "2025-03-15",
        eventEndDate: "2025-03-16",
        timestamp: new Date().toISOString(),
        _subject: "Talk to Concierge: Exclusive Wine Tasting in Napa Valley",
        message: "User Jane Smith (jane.smith@example.com) wants to talk to concierge about event: Exclusive Wine Tasting in Napa Valley. Details: Category: Wine & Spirits, Location: Napa Valley, California, Venue: Private Estate Winery, Date: 2025-03-15"
      }),
    });
    
    const data = await response.text();
    console.log("Talk to Concierge Response:", response.status, data);
    
    if (response.ok) {
      console.log("✅ Talk to Concierge form submission successful");
    } else {
      console.log("❌ Talk to Concierge form failed");
    }
  } catch (error) {
    console.error("❌ Talk to Concierge test failed:", error);
  }
};

// Run tests
(async () => {
  await testExpressInterest();
  console.log("\n");
  await testTalkToConcierge();
})();