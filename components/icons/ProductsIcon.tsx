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
      <Path d="M104 40H56a16 16 0 00-16 16v48a16 16 0 0016 16h48a16 16 0 0016-16V56a16 16 0 00-16-16zm0 64H56V56h48v48zm96-64h-48a16 16 0 00-16 16v48a16 16 0 0016 16h48a16 16 0 0016-16V56a16 16 0 00-16-16zm0 64h-48V56h48v48zm-96 32H56a16 16 0 00-16 16v48a16 16 0 0016 16h48a16 16 0 0016-16v-48a16 16 0 00-16-16zm0 64H56v-48h48v48zm96-64h-48a16 16 0 00-16 16v48a16 16 0 0016 16h48a16 16 0 0016-16v-48a16 16 0 00-16-16zm0 64h-48v-48h48v48z" />
    </Svg>
  )
}

export default SvgComponent
