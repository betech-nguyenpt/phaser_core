export class Common
{
    /**
     * Get window height
     * @returns The window height
     */
    static fnGetWindowHeight () : number
    {
        return window.innerHeight;
    }

    /**
     * Get window width
     * @returns The window width
     */
    static fnGetWindowWidth () : number
    {
        return window.innerWidth;
    }

    /**
     * Get browser type
     * @returns The browser name
     */
    static fnGetBrowserType () : string
    {
        const userAgent = navigator.userAgent;

        if (userAgent.includes('Edg/')) {
            return 'Microsoft Edge';
        }
        if (userAgent.includes('Firefox/')) {
            return 'Firefox';
        }
        if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
            return 'Chrome';
        }
        if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
            return 'Safari';
        }

        return 'Other';
    }

    /**
     * Async: fetch public IP
     * @returns IP address
     */
    static fnFetchPublicIpAddress = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) {
                return 'Unavailable';
            }

            const data = await response.json() as { ip?: string };
            return data.ip ?? 'Unavailable';
        }
        catch {
            return 'Unavailable';
        }
    };
    
    /**
     * Get device characteristics
     * @returns Device info
     */
    static fnGetDeviceCharacteristics = () => {
        const anyNavigator = navigator as Navigator & {
            deviceMemory?: number;
            userAgentData?: {
                mobile?: boolean;
                platform?: string;
            };
        };

        const memory = anyNavigator.deviceMemory ? `${anyNavigator.deviceMemory}GB RAM` : 'RAM N/A';
        const cores = `${navigator.hardwareConcurrency} cores`;
        // const touch = `${navigator.maxTouchPoints} touch`;    
        const screenSize = `${window.screen.width}x${window.screen.height}`;
        const dpr = `dpr ${window.devicePixelRatio}`;
        const platform = anyNavigator.userAgentData?.platform ?? navigator.platform ?? 'Unknown platform';

        return `${platform}\n                     ${memory}\n                     ${cores}\n                     ${screenSize}\n                     ${dpr}`;
    };

    static fnOverlay = (parent: string) => {
        const DEBUG_OVERLAY_ID = 'debug-window-overlay';
        const DEBUG_TEXT_ID    = 'debug-window-overlay-text';
        const parentElement = document.getElementById(parent) ?? document.body;
        let overlay         = document.getElementById(DEBUG_OVERLAY_ID);
        if (!overlay) {
            overlay                     = document.createElement('div');
            overlay.id                  = DEBUG_OVERLAY_ID;
            overlay.style.position      = 'fixed';
            overlay.style.top           = '8px';
            overlay.style.left          = '8px';
            overlay.style.zIndex        = '99999';
            overlay.style.pointerEvents = 'auto';
            overlay.style.display       = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.gap           = '6px';
            overlay.style.padding       = '6px 8px';
            overlay.style.borderRadius  = '4px';
            overlay.style.background    = 'rgba(0, 0, 0, 0.55)';
            overlay.style.color         = '#00ff90';
            overlay.style.fontFamily    = 'monospace';
            overlay.style.fontSize      = '13px';

            const debugText                 = document.createElement('pre');
            debugText.id                    = DEBUG_TEXT_ID;
            debugText.style.margin          = '0';
            debugText.style.whiteSpace      = 'pre';
            debugText.style.pointerEvents   = 'none';
            overlay.appendChild(debugText);

            parentElement.appendChild(overlay);
        }

        const debugLinesData = [
            `window.innerHeight : ${Common.fnGetWindowHeight()}px`,
            `window.innerWidth  : ${Common.fnGetWindowWidth()}px`,
        ];

        const debugText = overlay.querySelector(`#${DEBUG_TEXT_ID}`);
        if (debugText) {
            debugText.textContent = debugLinesData.join('\n');
        }
    }
}