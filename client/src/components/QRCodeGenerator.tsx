import { useRef, useEffect } from "react";
import QRCode from "qrcode";

export const QRCodeGenerator = ({ text }: { text: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, text, { width: 128, margin: 1 }, (error) => {
                if (error) console.error(error);
            });
        }
    }, [text]);

    return <canvas ref={canvasRef} />;
};
