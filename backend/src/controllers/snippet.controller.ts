import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';



const prisma = new PrismaClient();


export const getAllSnippets = async (req: Request, res: Response) => {
    try {
        const { language, tag, authorId, search, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {
            isPublic: true,
        };

        if (language) where.language = String(language);
        if (authorId) where.authorId = String(authorId);
        if (tag) where.tags = { contains: String(tag) };
        if (search) {
            where.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        const [snippets, total] = await Promise.all([
            prisma.snippet.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            }),
            prisma.snippet.count({ where }),
        ]);

        const parsedSnippets = snippets.map(s => ({
            ...s,
            tags: JSON.parse(s.tags)
        }));

        res.status(200).json({
            success: true,
            data: parsedSnippets,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error('Get all snippets error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getSnippetById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const snippet = await prisma.snippet.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                comments: {
                    include: {
                        author: { select: { id: true, username: true, avatar: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        likes: true,
                    },
                },
            },
        });

        if (!snippet) {
            return res.status(404).json({ success: false, message: 'Snippet not found' });
        }

        // Increment view count (async, don't await)
        prisma.snippet.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        }).catch(err => logger.error('Error incrementing view count', err));

        const parsedSnippet = {
            ...snippet,
            tags: JSON.parse(snippet.tags)
        };
        res.status(200).json({ success: true, snippet: parsedSnippet });
    } catch (error) {
        logger.error('Get snippet error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const createSnippet = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { title, description, code, language, tags, isPublic } = req.body;

        const createdSnippet = await prisma.snippet.create({
            data: {
                title,
                description,
                code,
                language,
                tags: JSON.stringify(tags || []),
                isPublic: isPublic !== undefined ? isPublic : true,
                authorId: userId,
            },
        });

        const responseSnippet = {
            ...createdSnippet,
            tags: JSON.parse(createdSnippet.tags)
        };

        res.status(201).json({ success: true, message: 'Snippet created successfully', snippet: responseSnippet });
    } catch (error) {
        logger.error('Create snippet error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateSnippet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const { title, description, code, language, tags, isPublic } = req.body;

        const snippet = await prisma.snippet.findUnique({ where: { id } });

        if (!snippet) {
            return res.status(404).json({ success: false, message: 'Snippet not found' });
        }

        if (snippet.authorId !== userId && req.user!.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedSnippet = await prisma.snippet.update({
            where: { id },
            data: {
                title,
                description,
                code,
                language,
                tags: tags ? JSON.stringify(tags) : undefined,
                isPublic,
            },
        });

        const responseSnippet = {
            ...updatedSnippet,
            tags: JSON.parse(updatedSnippet.tags)
        };

        res.status(200).json({ success: true, message: 'Snippet updated successfully', snippet: responseSnippet });
    } catch (error) {
        logger.error('Update snippet error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const deleteSnippet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        const snippet = await prisma.snippet.findUnique({ where: { id } });

        if (!snippet) {
            return res.status(404).json({ success: false, message: 'Snippet not found' });
        }

        if (snippet.authorId !== userId && req.user!.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await prisma.snippet.delete({ where: { id } });

        res.status(200).json({ success: true, message: 'Snippet deleted successfully' });
    } catch (error) {
        logger.error('Delete snippet error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const likeSnippet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        const existingLike = await prisma.like.findUnique({
            where: { userId_snippetId: { userId, snippetId: id } },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: { userId_snippetId: { userId, snippetId: id } },
            });
            return res.status(200).json({ success: true, message: 'Snippet unliked', liked: false });
        } else {
            await prisma.like.create({
                data: { userId, snippetId: id },
            });
            return res.status(200).json({ success: true, message: 'Snippet liked', liked: true });
        }
    } catch (error) {
        logger.error('Like snippet error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const addComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                snippetId: id,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(201).json({ success: true, message: 'Comment added', comment });
    } catch (error) {
        logger.error('Add comment error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
