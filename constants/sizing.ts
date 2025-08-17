import { getDimensions } from "@/utils/dimensions";
import { Dimensions } from "react-native";

const { width, height } = getDimensions();

/**
 * Configurable breakpoint generator
 * - start: minimum size
 * - step: how much each breakpoint increases
 * - count: how many breakpoints to generate
 */
function generateBreakpoints(start: number, step: number, count: number) {
  const breakpoints: number[] = [];
  for (let i = 0; i < count; i++) {
    breakpoints.push(start + i * step);
  }
  return breakpoints;
}

/**
 * Given a size and breakpoints, return the index (level)
 */
function getBreakpointLevel(size: number, breakpoints: number[]) {
  let level = 0;
  for (let i = 0; i < breakpoints.length; i++) {
    if (size >= breakpoints[i]) {
      level = i;
    } else {
      break;
    }
  }
  return level;
}

// Configurable breakpoint system
const widthBreakpoints = generateBreakpoints(300, 20, 8); // e.g. 320, 380, 440, ...
const heightBreakpoints = generateBreakpoints(480, 80, 8); // e.g. 480, 560, 640, ...

const widthLevel = getBreakpointLevel(width, widthBreakpoints);
const heightLevel = getBreakpointLevel(height, heightBreakpoints);

// Take the minimum level (more restrictive)
const breakpointLevel = Math.min(widthLevel, heightLevel);

// Create labels dynamically (bp-0, bp-1, bp-2, ...)
export type Breakpoint = `bp-${number}`;
const breakpoint: Breakpoint = `bp-${breakpointLevel}` as Breakpoint;

console.log({
  breakpoint,
  width,
  height,
  widthLevel,
  heightLevel,
  Dimensions: Dimensions.get("screen"),
});

/**
 * Generate sizing values based on breakpoint level
 * - You can tweak multipliers to scale differently per property
 */
function generateSizes(level: number) {
  const base = {
    padding: 8,
    margin: 8,
    logo: 22,
    icon: 24,
    fontSmall: 8,
    fontMedium: 10,
    fontLarge: 12,
    qr: 140,
    progress: 140,
    buttonHeight: 20,
  };

  const scale = 1 + level * 0.15; // 15% growth per level

  return {
    padding: Math.round(base.padding * scale),
    margin: Math.round(base.margin * scale),
    logo: Math.round(base.logo * scale),
    icon: Math.round(base.icon * scale),
    fontSmall: Math.round(base.fontSmall * scale),
    fontMedium: Math.round(base.fontMedium * scale),
    fontLarge: Math.round(base.fontLarge * scale),
    qr: Math.round(base.qr * scale),
    progress: Math.round(base.progress * scale),
    buttonHeight: Math.round(base.buttonHeight * scale),
  };
}

export const sizing = generateSizes(breakpointLevel);
