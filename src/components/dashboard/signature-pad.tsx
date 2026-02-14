"use client";

import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { RotateCcw, PenTool } from "lucide-react";

interface SignaturePadProps {
    onSave: (signatureData: string) => void;
    onClear?: () => void;
    label?: string;
}

export function SignaturePad({ onSave, onClear, label = "Sign below" }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => {
        sigCanvas.current?.clear();
        if (onClear) onClear();
    };

    const save = () => {
        if (sigCanvas.current?.isEmpty()) {
            return;
        }
        const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || "";
        onSave(signatureData);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <PenTool className="h-3 w-3" />
                    {label}
                </label>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    className="h-7 text-[10px] font-bold text-slate-400 hover:text-red-500 gap-1 uppercase tracking-tighter"
                >
                    <RotateCcw className="h-3 w-3" />
                    Clear
                </Button>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 overflow-hidden group hover:border-blue-200 transition-colors">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="#0f172a"
                    canvasProps={{
                        className: "signature-canvas w-full h-40 cursor-crosshair",
                        style: { width: '100%', height: '160px' }
                    }}
                    onEnd={save}
                />
            </div>

            <p className="text-[10px] text-slate-400 font-medium text-center italic">
                By signing here, you agree to the terms of the service agreement.
            </p>
        </div>
    );
}
