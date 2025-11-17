import { Request, Response, NextFunction } from 'express';

type AsysncController = (
    req: Request,
    res: Response,
    next:NextFunction
) => Promise<Response | void>;

const catchErrors=(controller:AsysncController):AsysncController=>
    async (req, res, next) => {
        try {
            await controller(req, res, next);
        } catch (error) {
            next(error);
        }
    };

export default catchErrors;