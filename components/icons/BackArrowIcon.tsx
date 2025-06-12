import { View, Text } from 'react-native'
import React from 'react'

import Svg, { Path } from "react-native-svg"
const BackArrowIcon = ({ props={} }) => {
    return (
        <Svg
            width="24px"
            height="24px"
            fill="currentColor"
            viewBox="0 0 256 256"
            {...props}
        >
            <Path d="M224 128a8 8 0 01-8 8H59.31l58.35 58.34a8 8 0 01-11.32 11.32l-72-72a8 8 0 010-11.32l72-72a8 8 0 0111.32 11.32L59.31 120H216a8 8 0 018 8z" />
        </Svg>
    )
}

export default BackArrowIcon