import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props={}) {
  return (
    <Svg

      width="24px"
      height="24px"
      fill="#121212"
      viewBox="0 0 256 256"
      {...props}
    >
      <Path d="M230.93 220a8 8 0 01-6.93 4H32a8 8 0 01-6.92-12c15.23-26.33 38.7-45.21 66.09-54.16a72 72 0 1173.66 0c27.39 8.95 50.86 27.83 66.09 54.16a8 8 0 01.01 8z" />
    </Svg>
  )
}

export default SvgComponent
