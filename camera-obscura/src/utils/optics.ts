import { OpticalComputation, OpticalParameters } from '../types';

/**
 * Deterministically computes optical parameters for the camera obscura pinhole model.
 * Formula: Image Height (h_i) = Object Height (h_o) * Screen Distance (d_i) / Object Distance (d_o)
 */
export function computeOptics(params: OpticalParameters): OpticalComputation {
  const { objectDistance, objectHeight, screenDistance } = params;

  // Guard against division by zero
  const d_o = Math.max(0.1, objectDistance);
  const d_i = Math.max(0.01, screenDistance);
  const h_o = Math.max(0.01, objectHeight);

  // Exact fundamental Camera Obscura equation
  const imageHeight = (h_o * d_i) / d_o;
  
  // Magnification magnitude
  const magnification = imageHeight / h_o;
  
  // Ratios representing tangent of half-angles (similar triangles slope)
  const objectRatio = h_o / d_o;
  const imageRatio = imageHeight / d_i;

  return {
    imageHeight,
    magnification,
    objectRatio,
    imageRatio,
  };
}

export function formatMeters(value: number, decimals = 3): string {
  return `${value.toFixed(decimals)} m`;
}

export function formatCentimeters(valueInMeters: number, decimals = 1): string {
  return `${(valueInMeters * 100).toFixed(decimals)} cm`;
}
