-- AlterTable
ALTER TABLE "production_batches" ADD COLUMN     "production_location" TEXT;

-- CreateTable
CREATE TABLE "production_batch_consumptions" (
    "id" TEXT NOT NULL,
    "production_batch_id" TEXT NOT NULL,
    "material_batch_id" TEXT NOT NULL,
    "recipe_item_id" TEXT,
    "consumed_quantity" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Kg',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "material_storage_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_batch_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "production_batch_consumptions_production_batch_id_idx" ON "production_batch_consumptions"("production_batch_id");

-- CreateIndex
CREATE INDEX "production_batch_consumptions_material_batch_id_idx" ON "production_batch_consumptions"("material_batch_id");

-- CreateIndex
CREATE INDEX "production_batch_consumptions_recipe_item_id_idx" ON "production_batch_consumptions"("recipe_item_id");

-- CreateIndex
CREATE INDEX "production_batch_consumptions_timestamp_idx" ON "production_batch_consumptions"("timestamp");

-- AddForeignKey
ALTER TABLE "production_batch_consumptions" ADD CONSTRAINT "production_batch_consumptions_production_batch_id_fkey" FOREIGN KEY ("production_batch_id") REFERENCES "production_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_batch_consumptions" ADD CONSTRAINT "production_batch_consumptions_material_batch_id_fkey" FOREIGN KEY ("material_batch_id") REFERENCES "material_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_batch_consumptions" ADD CONSTRAINT "production_batch_consumptions_recipe_item_id_fkey" FOREIGN KEY ("recipe_item_id") REFERENCES "recipe_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
