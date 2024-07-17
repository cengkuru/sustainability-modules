import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ScriptLoaderService {
    loadScripts(scripts: string[]): Promise<void[]> {
        const promises: Promise<void>[] = scripts.map(script => this.loadScript(script));
        return Promise.all(promises);
    }

    private loadScript(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = (error) => reject(error);
            document.body.appendChild(script);
        });
    }

    loadStyles(styles: string[]): Promise<void[]> {
        const promises: Promise<void>[] = styles.map(style => this.loadStyle(style));
        return Promise.all(promises);
    }

    private loadStyle(href: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => resolve();
            link.onerror = (error) => reject(error);
            document.head.appendChild(link);
        });
    }
}
