const plugin = require("tailwindcss/lib/plugin")

function filterDefault(values) {
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => key !== "DEFAULT"),
  )
}

module.exports = plugin(({ addUtilities, matchUtilities, theme }) => {
  addUtilities({
    "@keyframes enter": theme("keyframes.enter"),
    "@keyframes exit": theme("keyframes.exit"),
    ".animate-in": {
      animationName: "enter",
      animationDuration: theme("animationDuration.DEFAULT"),
      "--tw-enter-opacity": "initial",
      "--tw-enter-scale": "initial",
      "--tw-enter-rotate": "initial",
      "--tw-enter-translate-x": "initial",
      "--tw-enter-translate-y": "initial",
    },
    ".animate-out": {
      animationName: "exit",
      animationDuration: theme("animationDuration.DEFAULT"),
      "--tw-exit-opacity": "initial",
      "--tw-exit-scale": "initial",
      "--tw-exit-rotate": "initial",
      "--tw-exit-translate-x": "initial",
      "--tw-exit-translate-y": "initial",
    },
    ".running": { animationPlayState: "running" },
    ".paused": { animationPlayState: "paused" },
  })

  matchUtilities(
    {
      "fade-in": (value) => ({ "--tw-enter-opacity": value }),
      "fade-out": (value) => ({ "--tw-exit-opacity": value }),
    },
    { values: theme("animationOpacity") },
  )

  matchUtilities(
    {
      "zoom-in": (value) => ({ "--tw-enter-scale": value }),
      "zoom-out": (value) => ({ "--tw-exit-scale": value }),
    },
    { values: theme("animationScale") },
  )

  matchUtilities(
    {
      "spin-in": (value) => ({ "--tw-enter-rotate": value }),
      "spin-out": (value) => ({ "--tw-exit-rotate": value }),
    },
    { values: theme("animationRotate") },
  )

  matchUtilities(
    {
      "slide-in-from-top": (value) => ({ "--tw-enter-translate-y": `-${value}` }),
      "slide-in-from-bottom": (value) => ({ "--tw-enter-translate-y": value }),
      "slide-in-from-left": (value) => ({ "--tw-enter-translate-x": `-${value}` }),
      "slide-in-from-right": (value) => ({ "--tw-enter-translate-x": value }),
      "slide-out-to-top": (value) => ({ "--tw-exit-translate-y": `-${value}` }),
      "slide-out-to-bottom": (value) => ({ "--tw-exit-translate-y": value }),
      "slide-out-to-left": (value) => ({ "--tw-exit-translate-x": `-${value}` }),
      "slide-out-to-right": (value) => ({ "--tw-exit-translate-x": value }),
    },
    { values: theme("animationTranslate") },
  )

  matchUtilities(
    { duration: (value) => ({ animationDuration: value }) },
    { values: filterDefault(theme("animationDuration")) },
  )

  matchUtilities(
    { delay: (value) => ({ animationDelay: value }) },
    { values: theme("animationDelay") },
  )

  matchUtilities(
    { ease: (value) => ({ animationTimingFunction: value }) },
    { values: filterDefault(theme("animationTimingFunction")) },
  )

  matchUtilities(
    { "fill-mode": (value) => ({ animationFillMode: value }) },
    { values: theme("animationFillMode") },
  )

  matchUtilities(
    { direction: (value) => ({ animationDirection: value }) },
    { values: theme("animationDirection") },
  )

  matchUtilities(
    { repeat: (value) => ({ animationIterationCount: value }) },
    { values: theme("animationRepeat") },
  )
})
