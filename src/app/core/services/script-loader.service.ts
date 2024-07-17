import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ScriptLoaderService {
    private loadedScripts: { [url: string]: Promise<void> | undefined } = {};

    loadScript(url: string): Promise<void> {
        if (this.loadedScripts[url]) {
            return this.loadedScripts[url]!;
        }

        const promise = new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = true;

            script.onload = () => {
                resolve();
            };

            script.onerror = (error: any) => {
                reject(new Error(`Script load error for ${url}: ${error.message}`));
            };

            document.body.appendChild(script);
        });

        this.loadedScripts[url] = promise;
        return promise;
    }

    async loadScripts(urls: string[]): Promise<void> {
        try {
            await Promise.all(urls.map(url => this.loadScript(url)));
        } catch (error) {
            console.error('Error loading scripts:', error);
            throw error;
        }
    }
}
