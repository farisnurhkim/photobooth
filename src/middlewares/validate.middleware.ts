import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'yup';

const validate = (schema: AnySchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      { abortEarly: false } // Catch all validation errors
    );
    next();
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.inner ? err.inner.map((e: any) => ({ field: e.path, message: e.message })) : err.message,
    });
  }
};

export default validate;
