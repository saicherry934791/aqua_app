import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props={}) {
  return (
    <Svg
      width="24px"
      height="24px"
      fill="currentColor"
      viewBox="0 0 256 256"
      {...props}
    >
      <Path d="M224 115.55V208a16 16 0 01-16 16h-40a16 16 0 01-16-16v-40a8 8 0 00-8-8h-32a8 8 0 00-8 8v40a16 16 0 01-16 16H48a16 16 0 01-16-16v-92.45a16 16 0 015.17-11.78l80-75.48.11-.11a16 16 0 0121.53 0 1.14 1.14 0 00.11.11l80 75.48a16 16 0 015.08 11.78z" />
    </Svg>
  )
}

export default SvgComponent
