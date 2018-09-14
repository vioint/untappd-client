"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UntappdClient {
    constructor(opts) {
        this.debug = false;
        this.clientToken = '';
        this.clientSecret = '';
        this.clientId = '';
        this.defaultOpts = {
            debug: false
        };
        opts = Object.assign(this.defaultOpts, opts);
        if (opts.clientId === null) {
            throw new Error('A client identifier is required.');
        }
        if (opts.clientSecret === null) {
            throw new Error('A client secret is required.');
        }
    }
}
