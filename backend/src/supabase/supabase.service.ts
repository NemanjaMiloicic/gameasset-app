import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {

    private readonly _client: SupabaseClient;
    private readonly _bucket: string;

    constructor(private readonly _configService: ConfigService) {
        this._client = createClient(
            this._configService.get('SUPABASE_URL'),
            this._configService.get('SUPABASE_SECRET_KEY')
        );
        this._bucket = this._configService.get('SUPABASE_BUCKET');
    }

    async uploadFile(path: string, file: Buffer, contentType: string): Promise<string> {
        const {error} = await this._client.storage
            .from(this._bucket)
            .upload(path, file, {contentType, upsert: false});

        if(error)
            throw new Error(`Supabase upload failed: ${error.message}`);

        const {data} = this._client.storage.from(this._bucket).getPublicUrl(path);
        return data.publicUrl;
    }

    async deleteFileByUrl(url: string): Promise<void> {
        const path = this._extractPathFromUrl(url);
        await this._client.storage.from(this._bucket).remove([path]);
    }

     async deleteFilesByUrls(urls: string[]): Promise<void> {
        if (urls.length === 0) return;
        const paths = urls.map((url) => this._extractPathFromUrl(url));
        await this._client.storage.from(this._bucket).remove(paths);
    }

    private _extractPathFromUrl(url: string): string {
        const marker = `/storage/v1/object/public/${this._bucket}/`;
        return url.split(marker)[1];
    }


}