/**
 * Shared Mongoose plugin: serialise documents the way the React app expects.
 *  - `_id`  -> `id` (string)
 *  - drop `__v`
 *  - ObjectId references become plain strings
 */
export function toJSONPlugin(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      ret.id = String(ret._id);
      delete ret._id;
      for (const key of Object.keys(ret)) {
        const v = ret[key];
        if (v && typeof v === 'object' && v._bsontype === 'ObjectId') ret[key] = String(v);
      }
      return ret;
    },
  });
  schema.set('toObject', { virtuals: true, versionKey: false });
}
