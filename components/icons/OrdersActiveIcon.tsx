import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      fill="currentColor"
      viewBox="0 0 256 256"
      {...props}
    >
      <Path d="M247.43 117l-14-35a15.93 15.93 0 00-14.85-10H184v-8a8 8 0 00-8-8H24A16 16 0 008 72v112a16 16 0 0016 16h17a32 32 0 0062 0h50a32 32 0 0062 0h17a16 16 0 0016-16v-64a8.13 8.13 0 00-.57-3zM72 208a16 16 0 1116-16 16 16 0 01-16 16zm-48-72V72h144v64zm160 72a16 16 0 1116-16 16 16 0 01-16 16zm0-96V88h34.58l9.6 24z" />
    </Svg>
  )
}

export default SvgComponent
