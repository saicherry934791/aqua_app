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
      <Path d="M247.42 117l-14-35a15.93 15.93 0 00-14.84-10H184v-8a8 8 0 00-8-8H24A16 16 0 008 72v112a16 16 0 0016 16h17a32 32 0 0062 0h50a32 32 0 0062 0h17a16 16 0 0016-16v-64a7.94 7.94 0 00-.58-3zM184 88h34.58l9.6 24H184zM24 72h144v64H24zm48 136a16 16 0 1116-16 16 16 0 01-16 16zm81-24h-50a32 32 0 00-62 0H24v-32h144v12.31A32.11 32.11 0 00153 184zm31 24a16 16 0 1116-16 16 16 0 01-16 16zm48-24h-17a32.06 32.06 0 00-31-24v-32h48z" />
    </Svg>
  )
}

export default SvgComponent
