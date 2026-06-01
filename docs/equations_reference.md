# Equations Reference

## Overview
- **Version**: 0.0.1
- **Description**: Documentation about equations used in this app
- **Reference**: Linear Interpolation, `Math.atan2(y, x)`

## Table of Contents
- **Hand Rotation**
  - `Math.atan2(y, x)` function
  - Normalization
- **Mapping Parameter Output**
  - Linear Interpolation

## **Hand Rotation**

### `Math.atan2(y, x)` function

> The `Math.atan2()` static method returns the angle in the plane (in radians) between the positive x-axis and the ray from (0, 0) to (x, y), for Math.atan(y, x).
Source: [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2)

The `atan2()` function is basically the inverse of the `atan()` function. If you want to know how atan2 works, you have to know atan first. I'm not going to deep dive into this function. If you're wondering about this function, you can visit this reference [atan2()](https://css-tricks.com/almanac/functions/a/atan2/).

Let's see the diagram below to easily understand the concept of `atan2()`:

![atan2 axis](images/atan2_diagram.svg)

The diagram above represents the angle in radians between the positive/negative x-axis and the ray from (0, 0) to point (-x, y) and point (x, y), using the formula `atan2(y, x)`.
I will use this function to calculate the angle in radians from hand rotation, but I need some adjustments. I have decided to use the wrist and middle fingertip landmarks as base points to detect hand rotation. To make it easier, let's define variables for wrist and middle fingertip: wrist => (wrist.z, wrist.y), middle fingertip => (midtip.z, midtip.y). Let's assume that both landmarks are placed on the y-axis in the initial state, and I will rotate around the z-axis (in MediaPipe, the z-axis is perpendicular to the camera).

Here is the adjustment. What I need is to find the angle in radians between the y-axis and the ray from the joint points between the wrist and middle fingertip. If represented in a diagram, it will be like this.

![atan2 axis from y to z](images/atan2_z_y_axis.svg)

I make the wrist the pivot point, because `atan2()` calculates the ray from point (0, 0). We need an adjustment to calculate the point so it will be relative to the wrist. The point on the wrist always has a bigger value than the middle fingertip, and the middle fingertip always moves toward and away from the camera, so the adjustment formula will be like this.

$$
Δy = wrist.y - midtip.y
$$
$$
Δz = midtip.z - wrist.z
$$

Because I need to find the angle in radians between the y-axis and the ray from (0, 0) to point (Δz, Δy), I will use the `atan2()` function with parameters like this: `Math.atan2(Δz, Δy)`.

### Normalization

I have defined the max rotation to be 60°, both toward and away from the camera. I have to convert it to radians:
A full circle contains 2π, so we get the equation like this:

$$
2\pi = 360°
$$

If we want to find the radians for 60°, the equation will be like this ($x$ = radians value):

$$
\begin{equation*}
\begin{aligned}
\frac {x}{2\pi} &= \frac {60}{360} 
\\
x &= \frac {120\pi} {360}
\\
x &= \frac {\pi}{3}
\end{aligned}
\end{equation*}
$$

From the equation above, the radians value will be $\frac{\pi}{3}$ or 1.047 for away from the camera, -1.047 for toward the camera.

$$
-1.047 \leq angle \leq 1.047
$$

After the max radians has been calculated, I need to do normalization. Normalization will make the calculation for the parameter that we need easier furthermore. I will normalize to -1 and 1. This normalization is commonly used in DAW (Digital Audio Workstation) applications.

$$
\begin{equation*}
\frac {-1.047}{1.047} \leq angle \leq \frac {1.047}{1.047}
\end{equation*}
$$

$$
\begin{equation*}
-1 \leq angle \leq 1
\end{equation*}
$$
