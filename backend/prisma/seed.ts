import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPasswordLocal = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

async function main() {
    // 1. Upsert Users
    const user1 = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            email: 'john@example.com',
            username: 'johndoe',
            password: await hashPasswordLocal('password123'),
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Full-stack developer',
            role: 'USER',
        },
    });

    const admin = await prisma.user.upsert({
        where: { email: 'admin@devinsight.com' },
        update: {},
        create: {
            email: 'admin@devinsight.com',
            username: 'admin',
            password: await hashPasswordLocal('admin123'),
            firstName: 'Admin',
            lastName: 'User',
            bio: 'System Administrator',
            role: 'ADMIN',
        },
    });

    // 2. Create sample snippets (Cleanup by title to avoid complexity of ID or duplicates)
    const snippetToDelete = await prisma.snippet.findFirst({
        where: { title: 'React Custom Hook for API Calls' }
    });

    if (snippetToDelete) {
        await prisma.like.deleteMany({ where: { snippetId: snippetToDelete.id } });
        await prisma.comment.deleteMany({ where: { snippetId: snippetToDelete.id } });
        await prisma.snippet.delete({ where: { id: snippetToDelete.id } });
    }

    await prisma.snippet.create({
        data: {
            title: 'React Custom Hook for API Calls',
            description: 'A reusable custom hook for making API calls with loading and error states',
            code: `import { useState, useEffect } from 'react';

export const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
};`,
            language: 'javascript',
            tags: JSON.stringify(['react', 'hooks', 'api']),
            authorId: user1.id,
        },
    });

    // 3. Create sample challenges
    const challenges = [
        {
            title: 'Two Sum',
            description: '# Two Sum\\n\\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\\n\\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\\n\\nYou can return the answer in any order.\\n\\n### Example 1:\\n```\\nInput: nums = [2,7,11,15], target = 9\\nOutput: [0,1]\\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\\n```\\n\\n### Example 2:\\n```\\nInput: nums = [3,2,4], target = 6\\nOutput: [1,2]\\n```\\n\\n### Constraints:\\n* 2 <= nums.length <= 10^4\\n* -10^9 <= nums[i] <= 10^9\\n* -10^9 <= target <= 10^9\\n* **Only one valid answer exists.**\\n',
            difficulty: 'EASY',
            category: 'Arrays',
            starterCode: 'function twoSum(nums, target) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
                { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
                { input: [[3, 3], 6], expectedOutput: [0, 1] }
            ]),
            points: 100,
            tags: JSON.stringify(['arrays', 'hash-table', 'algorithms']),
        },
        {
            title: 'Roman to Integer',
            description: '# Roman to Integer\\n\\nRoman numerals are represented by seven different symbols: I, V, X, L, C, D and M.\\n\\nGiven a roman numeral, convert it to an integer.\\n\\n### Example 1:\\n```\\nInput: s = "III"\\nOutput: 3\\n```\\n\\n### Example 2:\\n```\\nInput: s = "LVIII"\\nOutput: 58\\nExplanation: L = 50, V= 5, III = 3.\\n```\\n',
            difficulty: 'EASY',
            category: 'Math',
            starterCode: 'function romanToInt(s) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: "III", expectedOutput: 3 },
                { input: "LVIII", expectedOutput: 58 },
                { input: "MCMXCIV", expectedOutput: 1994 }
            ]),
            points: 100,
            tags: JSON.stringify(['hash-table', 'math', 'string']),
        },
        {
            title: '3Sum',
            description: '# 3Sum\\n\\nGiven an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\\n\\nNotice that the solution set must not contain duplicate triplets.\\n\\n### Example 1:\\n```\\nInput: nums = [-1,0,1,2,-1,-4]\\nOutput: [[-1,-1,2],[-1,0,1]]\\n```\\n',
            difficulty: 'MEDIUM',
            category: 'Arrays',
            starterCode: 'function threeSum(nums) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: [-1, 0, 1, 2, -1, -4], expectedOutput: [[-1, -1, 2], [-1, 0, 1]] },
                { input: [0, 1, 1], expectedOutput: [] },
                { input: [0, 0, 0], expectedOutput: [[0, 0, 0]] }
            ]),
            points: 200,
            tags: JSON.stringify(['array', 'two-pointers', 'sorting']),
        },
        {
            title: 'Number of 1 Bits',
            description: '# Number of 1 Bits\\n\\nWrite a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).\\n\\n### Example 1:\\n```\\nInput: n = 11\\nOutput: 3\\nExplanation: The input binary string 00000000000000000000000000001011 has a total of three set bits.\\n```\\n',
            difficulty: 'EASY',
            category: 'Bit Manipulation',
            starterCode: 'function hammingWeight(n) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: 11, expectedOutput: 3 },
                { input: 128, expectedOutput: 1 },
                { input: 2147483645, expectedOutput: 30 }
            ]),
            points: 100,
            tags: JSON.stringify(['bit-manipulation']),
        },
        {
            title: 'Palindrome Number',
            description: '# Palindrome Number\\n\\nGiven an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\\n\\n### Example 1:\\n```\\nInput: x = 121\\nOutput: true\\n```\\n\\n### Example 2:\\n```\\nInput: x = -121\\nOutput: false\\nExplanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.\\n```\\n',
            difficulty: 'EASY',
            category: 'Math',
            starterCode: 'function isPalindrome(x) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: 121, expectedOutput: true },
                { input: -121, expectedOutput: false },
                { input: 10, expectedOutput: false }
            ]),
            points: 100,
            tags: JSON.stringify(['math']),
        },
        {
            title: 'Merge Sorted Array',
            description: '# Merge Sorted Array\\n\\nYou are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n`, representing the number of elements in `nums1` and `nums2` respectively.\\n\\nMerge `nums1` and `nums2` into a single array sorted in non-decreasing order.\\n\\nThe final sorted array should not be returned by the function, but instead be stored inside the array `nums1`. However, for this platform, **please return the sorted array `nums1`**.\\n\\n### Example 1:\\n```\\nInput: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\\nOutput: [1,2,2,3,5,6]\\n```\\n',
            difficulty: 'EASY',
            category: 'Arrays',
            starterCode: 'function merge(nums1, m, nums2, n) {\\n  // Your code here\\n  return nums1;\\n}',
            testCases: JSON.stringify([
                { input: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], expectedOutput: [1, 2, 2, 3, 5, 6] },
                { input: [[1], 1, [], 0], expectedOutput: [1] },
                { input: [[0], 0, [1], 1], expectedOutput: [1] }
            ]),
            points: 100,
            tags: JSON.stringify(['array', 'two-pointers', 'sorting']),
        },
        {
            title: 'Fibonacci Number',
            description: '# Fibonacci Number\\n\\nThe Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\\n\\nGiven `n`, calculate `F(n)`.\\n\\n### Example 1:\\n```\\nInput: n = 2\\nOutput: 1\\nExplanation: F(2) = F(1) + F(0) = 1 + 0 = 1.\\n```\\n',
            difficulty: 'EASY',
            category: 'Dynamic Programming',
            starterCode: 'function fib(n) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: 2, expectedOutput: 1 },
                { input: 3, expectedOutput: 2 },
                { input: 4, expectedOutput: 3 }
            ]),
            points: 100,
            tags: JSON.stringify(['math', 'dynamic-programming']),
        },
        {
            title: 'Remove Duplicates from Sorted Array',
            description: '# Remove Duplicates from Sorted Array\\n\\nGiven an integer array `nums` sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.\\n\\nReturn `k` after placing the final result in the first `k` slots of `nums`.\\n\\n**For this platform, return the number of unique elements `k`.**\\n\\n### Example 1:\\n```\\nInput: nums = [1,1,2]\\nOutput: 2\\n```\\n',
            difficulty: 'EASY',
            category: 'Arrays',
            starterCode: 'function removeDuplicates(nums) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: [[1, 1, 2]], expectedOutput: 2 },
                { input: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expectedOutput: 5 }
            ]),
            points: 100,
            tags: JSON.stringify(['array', 'two-pointers']),
        },
        {
            title: 'Best Time to Buy and Sell Stock',
            description: '# Best Time to Buy and Sell Stock\\n\\nYou are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\\n\\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\\n\\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.\\n\\n### Example 1:\\n```\\nInput: prices = [7,1,5,3,6,4]\\nOutput: 5\\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.\\n```\\n',
            difficulty: 'EASY',
            category: 'Dynamic Programming',
            starterCode: 'function maxProfit(prices) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: [7, 1, 5, 3, 6, 4], expectedOutput: 5 },
                { input: [7, 6, 4, 3, 1], expectedOutput: 0 }
            ]),
            points: 100,
            tags: JSON.stringify(['array', 'dynamic-programming']),
        },
        {
            title: 'Median of Two Sorted Arrays',
            description: '# Median of Two Sorted Arrays\\n\\nGiven two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\\n\\nThe overall run time complexity should be O(log (m+n)).\\n\\n### Example 1:\\n```\\nInput: nums1 = [1,3], nums2 = [2]\\nOutput: 2.00000\\n```\\n',
            difficulty: 'HARD',
            category: 'Algorithms',
            starterCode: 'function findMedianSortedArrays(nums1, nums2) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: [[1, 3], [2]], expectedOutput: 2 },
                { input: [[1, 2], [3, 4]], expectedOutput: 2.5 }
            ]),
            points: 300,
            tags: JSON.stringify(['array', 'binary-search', 'divide-and-conquer']),
        },
        {
            title: 'N-Repeated Element in Size 2N Array',
            description: '# N-Repeated Element in Size 2N Array\\n\\nYou are given an integer array `nums` with the following properties:\\n\\n* `nums.length == 2 * n`\\n* `nums` contains `n + 1` unique elements.\\n* Exactly one element of `nums` is repeated `n` times.\\n\\nReturn the element that is repeated `n` times.\\n\\n### Example 1:\\n```\\nInput: nums = [1,2,3,3]\\nOutput: 3\\n```\\n',
            difficulty: 'EASY',
            category: 'Hash Table',
            starterCode: 'function repeatedNTimes(nums) {\\n  // Your code here\\n}',
            testCases: JSON.stringify([
                { input: [1, 2, 3, 3], expectedOutput: 3 },
                { input: [2, 1, 2, 5, 3, 2], expectedOutput: 2 },
                { input: [5, 1, 5, 2, 5, 3, 5, 4], expectedOutput: 5 }
            ]),
            points: 100,
            tags: JSON.stringify(['array', 'hash-table']),
        }
    ];

    for (const challenge of challenges) {
        const existing = await prisma.challenge.findFirst({
            where: { title: challenge.title }
        });

        if (existing) {
            await prisma.challengeSubmission.deleteMany({
                where: { challengeId: existing.id }
            });
            await prisma.challenge.delete({
                where: { id: existing.id }
            });
        }

        await prisma.challenge.create({
            data: {
                title: challenge.title,
                description: challenge.description,
                difficulty: challenge.difficulty as any,
                category: challenge.category,
                starterCode: challenge.starterCode,
                testCases: challenge.testCases,
                points: challenge.points,
                tags: challenge.tags,
            }
        });
    }

    // 4. Create achievements
    // Only one, upsert it? 'First Snippet' logic
    // Just find first to check existence
    const existingAchievement = await prisma.achievement.findFirst({
        where: { name: 'First Snippet' }
    });

    if (!existingAchievement) {
        await prisma.achievement.create({
            data: {
                name: 'First Snippet',
                description: 'Create your first code snippet',
                icon: '🎉',
                condition: '{}',
            },
        });
    }

    console.log('Database seeded successfully');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
