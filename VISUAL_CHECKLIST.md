# Visual Checklist - Ask Rohith vs Rest of App

## Please Check These Specific Elements

### 1. Background Colors

**Ask Rohith should show:**
- Main background: **Very dark (#0A0A0A)** - almost black
- Sidebar background: **Slightly lighter dark (#141414)**
- Message cards: **Same as sidebar (#141414)**

**Compare with:**
- Decision Memo page background
- Dashboard background
- Should be **exactly the same dark color**

❓ **What do you see instead?**
- [ ] Background is lighter/different shade?
- [ ] Background is completely different color?
- [ ] Sidebar is different color than main area?

---

### 2. Text Colors

**Ask Rohith should show:**
- Main text (messages): **Off-white (#F5F5F5)** - bright and readable
- Secondary text (timestamps): **Gray (#A3A3A3)** - muted
- "Rohith Intelligence" label: **Gold (#D4A843)** - warm yellow-gold

**Compare with:**
- Decision Memo text
- Dashboard text
- Should be **exactly the same colors**

❓ **What do you see instead?**
- [ ] Text is pure white instead of off-white?
- [ ] Text is too dark/hard to read?
- [ ] Gold color is orange or different shade?
- [ ] Labels are different color?

---

### 3. Fonts

**Ask Rohith should show:**
- All body text: **Inter** (Google Font) - clean, modern sans-serif
- Code/labels: **JetBrains Mono** - monospace font
- Should look **identical** to Decision Memo fonts

**Compare with:**
- Decision Memo page fonts
- Dashboard fonts

❓ **What do you see instead?**
- [ ] Font looks like Arial/Helvetica (system font)?
- [ ] Font looks like Times New Roman (serif)?
- [ ] Font is different weight (thinner/bolder)?
- [ ] Spacing between letters is different?

---

### 4. Icons

**Ask Rohith uses:**
- Send icon: Arrow pointing right →
- Plus icon: + symbol
- MessageSquare icon: Chat bubble
- All from **Lucide React** (same as rest of app)

**Compare with:**
- Decision Memo icons
- Dashboard icons

❓ **What do you see instead?**
- [ ] Icons look different/uglier?
- [ ] Icons are different style (outlined vs filled)?
- [ ] Icons are missing?

---

### 5. Buttons

**New Chat button should show:**
- Background: **Gold (#D4A843)**
- Text: **Dark/black** (for contrast)
- Hover: **Darker gold (#8B7532)**

**Send button should show:**
- Same gold colors as New Chat button

**Compare with:**
- Primary buttons elsewhere in app

❓ **What do you see instead?**
- [ ] Button is different color (blue, green, etc.)?
- [ ] Button text is white instead of dark?
- [ ] Hover effect is different?

---

### 6. Input Field

**Query input should show:**
- Background: **Transparent**
- Border bottom: **Gray (#262626)**
- Focus border: **Gold (#D4A843)**
- Text: **Off-white (#F5F5F5)**
- Placeholder: **Muted gray**

❓ **What do you see instead?**
- [ ] Input has white/light background?
- [ ] Border is different color?
- [ ] Focus doesn't show gold?

---

### 7. Sidebar (when open)

**Conversation list should show:**
- Active conversation: **Gold background (#D4A843 10% opacity)** with gold border
- Active text: **Gold (#D4A843)**
- Inactive text: **Off-white (#F5F5F5)**
- Hover: **Subtle gray background**

❓ **What do you see instead?**
- [ ] Active item is different color?
- [ ] No gold highlighting?
- [ ] Different hover effect?

---

## Quick Test

1. **Open Ask Rohith** - http://localhost:3001/ask-rohith
2. **Open Decision Memo** in new tab - http://localhost:3001/decision-memo
3. **Compare side-by-side**

### Should Be IDENTICAL:
- ✅ Background color (both dark #0A0A0A)
- ✅ Text color (both off-white #F5F5F5)
- ✅ Font family (both Inter)
- ✅ Gold accents (both #D4A843)
- ✅ Border colors (both #262626)

---

## Please Tell Me Specifically:

1. **Which element** looks different? (background, text, button, icon, etc.)
2. **What color/font** do you see instead?
3. **Which page** are you comparing it to?

**Example:**
- "The message text in Ask Rohith is pure white #FFFFFF, but in Decision Memo it's off-white #F5F5F5"
- "The font in Ask Rohith looks like Arial, but Decision Memo uses Inter"
- "The gold buttons are orange #FFA500 instead of gold #D4A843"

This will help me identify exactly what's wrong!
