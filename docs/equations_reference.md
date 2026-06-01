# Equations Reference

## Overview
- **Version**: 0.0.1
- **Description**: Documentation about equations that used in this app
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

`atan2()` function basically inverse `atan()` function. if you want to know how atan2 works you have to know atan first, im not gonna deep down into this function. if you wondering about this function you can visit this reference [atan2()](https://css-tricks.com/almanac/functions/a/atan2/).

lets see this diagram below to easy understanding concept of `atan2()`:

![atan2 axis](images/atan2_diagram.svg)

diagram above is represent angle radians between positive/negative x-axis and the ray from (0, 0) to point (-x, y) and point (x, y) so it will use this formula `atan2(y, x)`.
I will use this function to calculate angle radians from hand rotation, but i need some adjustment. I have decided to make wrist and middle fingertip landmark as base point to detect hand rotation, to be more easy lets define variable for wirst and middle fingertip: wrist => (wrist.z, wrist.y), middle fingertip => (midtip.z, midtip.y). Lets assume that both landmarks placed on y-axis at initial state, and i will be rotate based on z-axis (in mediapipe z-axis is perpendicular to the camera).

Here is the adjustment. What i need is to find angle radians between y-axis and and the rays from joint points between wrist and middle fingertip. If represent to diagram it will be like this.

![atan2 axis from y to z](images/atan2_z_y_axis.svg)

I make the wrist as pivot point, because `atan2()` calculate ray from point (0, 0) we need adjustment to calculate point so it will be relative to wrist. point on wrist alwas has bigger value than middle fingertip and middle fingertip always toward and backward to the camera so the adjustment formula will be like this.

$$
Δy = wrist.y - midtip.y
$$
$$
Δz = midtip.z - wrist.z
$$

Because i need to find angle radians between y-axis and ray from (0, 0) to point (Δz, Δy) i will use `atan2()` function  like this `Math.atan2(Δz, Δy)`
