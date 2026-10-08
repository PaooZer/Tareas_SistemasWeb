import type { Request, Response } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../conf/dbConnection.ts";

interface Product extends RowDataPacket {
    id: number;
    name: string;
    price: string | number;
    stock: number;
    description: string;
    brand: string | null;
    img: string | null;
    active: number | boolean;
}

type ProductInput = {
    name: string;
    price: number;
    stock: number;
    description: string;
    brand: string | null;
    img: string | null;
};

// Comprueba que el cuerpo sea un objeto JSON.
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object"
        && value !== null
        && !Array.isArray(value);
}

function validPrice(value: unknown): value is number {
    return typeof value === "number"
        && Number.isFinite(value)
        && value > 0;
}

// Valida el ID antes de consultar MySQL.
function getId(req: Request, res: Response): number | null {
    const rawId = req.params["id"];

    if (typeof rawId !== "string" || !/^[0-9]+$/.test(rawId)) {
        res.status(400).json({
            message: "El ID debe ser un entero positivo."
        });
        return null;
    }

    const id = Number(rawId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({
            message: "El ID debe ser un entero positivo."
        });
        return null;
    }

    return id;
}

// Validación compartida por POST y PUT.
function readProduct(body: unknown): ProductInput | null {
    if (!isObject(body)) return null;

    const { name, price, stock, description, brand, img } = body;

    if (typeof name !== "string" || name.trim() === "") return null;
    if (!validPrice(price)) return null;

    if (
        typeof stock !== "number"
        || !Number.isSafeInteger(stock)
        || stock < 0
    ) return null;

    if (
        typeof description !== "string"
        || description.trim() === ""
    ) return null;

    if (
        brand !== undefined
        && brand !== null
        && typeof brand !== "string"
    ) return null;

    if (
        img !== undefined
        && img !== null
        && typeof img !== "string"
    ) return null;

    return {
        name: name.trim(),
        price,
        stock,
        description: description.trim(),
        brand: brand ?? null,
        img: img ?? null
    };
}

function invalidProduct(res: Response) {
    return res.status(400).json({
        message: "Se requieren name y description no vacíos, price numérico mayor que cero y stock entero no negativo. brand e img son opcionales."
    });
}

function notFound(res: Response) {
    return res.status(404).json({
        message: "Producto no encontrado o inactivo."
    });
}

function databaseError(res: Response) {
    return res.status(500).json({
        message: "No se pudo completar la operación con la base de datos."
    });
}

export class ProductController {
    public async getAllProducts(req: Request, res: Response) {
        // Sólo permitimos consultar productos activos.
        const active = req.query["active"];

        if (
            active !== undefined
            && active !== "true"
            && active !== "TRUE"
        ) {
            return res.status(400).json({
                message: "La consulta sólo admite active=true."
            });
        }

        try {
            const [products] = await pool.execute<Product[]>(
                `SELECT id, name, price, stock, description, brand, img, active
                 FROM products
                 WHERE active = ?
                 ORDER BY id`,
                [true]
            );

            return res.status(200).json(products);
        } catch {
            return databaseError(res);
        }
    }

    public async getProductById(req: Request, res: Response) {
        const id = getId(req, res);
        if (id === null) return;

        try {
            const [products] = await pool.execute<Product[]>(
                `SELECT id, name, price, stock, description, brand, img, active
                 FROM products
                 WHERE id = ? AND active = ?`,
                [id, true]
            );

            const product = products[0];

            if (!product) return notFound(res);

            return res.status(200).json(product);
        } catch {
            return databaseError(res);
        }
    }

    public async createProduct(req: Request, res: Response) {
        const product = readProduct(req.body);
        if (!product) return invalidProduct(res);

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                `INSERT INTO products
                 (name, price, stock, description, brand, img, active)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    product.name,
                    product.price,
                    product.stock,
                    product.description,
                    product.brand,
                    product.img,
                    true
                ]
            );

            return res.status(201).json({
                message: "Producto creado.",
                id: result.insertId
            });
        } catch {
            return databaseError(res);
        }
    }

    public async updateProductById(req: Request, res: Response) {
        const id = getId(req, res);
        if (id === null) return;

        const product = readProduct(req.body);
        if (!product) return invalidProduct(res);

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                `UPDATE products
                 SET name = ?, price = ?, stock = ?,
                     description = ?, brand = ?, img = ?
                 WHERE id = ? AND active = ?`,
                [
                    product.name,
                    product.price,
                    product.stock,
                    product.description,
                    product.brand,
                    product.img,
                    id,
                    true
                ]
            );

            if (result.affectedRows === 0) return notFound(res);

            return res.status(200).json({
                message: "Producto actualizado.",
                id
            });
        } catch {
            return databaseError(res);
        }
    }

    public async deleteProductById(req: Request, res: Response) {
        const id = getId(req, res);
        if (id === null) return;

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                `UPDATE products
                 SET active = ?
                 WHERE id = ? AND active = ?`,
                [false, id, true]
            );

            if (result.affectedRows === 0) return notFound(res);

            return res.status(200).json({
                message: "Producto dado de baja.",
                id
            });
        } catch {
            return databaseError(res);
        }
    }

    public async changeProductPrice(req: Request, res: Response) {
        const id = getId(req, res);
        if (id === null) return;

        const body: unknown = req.body;

        if (
            !isObject(body)
            || Object.keys(body).length !== 1
            || !validPrice(body["price"])
        ) {
            return res.status(400).json({
                message: "El cuerpo debe contener únicamente price, numérico y mayor que cero."
            });
        }

        const price = body["price"];

        try {
            const [result] = await pool.execute<ResultSetHeader>(
                `UPDATE products
                 SET price = ?
                 WHERE id = ? AND active = ?`,
                [price, id, true]
            );

            if (result.affectedRows === 0) return notFound(res);

            return res.status(200).json({
                message: "Precio actualizado.",
                id,
                price
            });
        } catch {
            return databaseError(res);
        }
    }
}