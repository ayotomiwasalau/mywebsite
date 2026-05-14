"use client";
import { RotatingLines } from "react-loader-spinner";

export function rotatingSpinner() {
    return (
        <div className="flex justify-center items-center h-full w-full py-16 bg-white ">
            <RotatingLines
                strokeColor="grey"
                strokeWidth="5"
                animationDuration="0.75"
                width="48"
                visible={true}
            />
        </div>
    )
}
