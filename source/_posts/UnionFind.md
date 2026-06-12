---
title: UnionFind
tags: []
categories: []
sticky: 0
date: 2026-02-12 21:01:53
updated: 2026-02-12 21:01:53
expires:
keywords:
excerpt: “记录了并查集（Disjoint Sets）算法如何通过「加权」和「路径压缩」两步优化，将操作复杂度从 O(N) 降低到近乎 O(1) 的 α(N)。”
top_img:
thumbnail:
cover:
---


在 CS 61B 的学习中，并查集（Disjoint Sets）是我遇到的第一个让我也感觉到“算法之美”的数据结构。

它的需求非常简单：维护一堆不相交的集合，支持两个操作：
1.  `connect(p, q)`: 将 p 和 q 所在的集合合并。
2.  `isConnected(p, q)`: 判断 p 和 q 是否在同一个集合。

虽然看似简单，但从最朴素的实现到最优实现，性能有着天壤之别。

## 演进过程

### 1. 初始思路：Quick Find vs Quick Union
* **Quick Find**: 使用数组 `id[]`，`id[i]` 表示 i 所属的集合 ID。
    * 优点：`isConnected` 是 $O(1)$。
    * 缺点：`connect` 需要遍历整个数组修改 ID，是 $O(N)$。太慢。
* **Quick Union**: 把数组看作树，`parent[i]` 指向 i 的父节点。
    * 优点：`connect` 只需要修改根节点的指向。
    * 缺点：树可能会退化成一条长链，导致 `find` 操作变成 $O(N)$。

### 2. 优化一：加权 (Weighted Quick Union)
为了防止树长得太高，我们在合并时遵循一个原则：**总是把小树（节点少）挂在大树的根节点下面**。
这样可以保证树的高度始终维持在 $O(\log N)$ 级别。

### 3. 优化二：路径压缩 (Path Compression) ⚡️
这是最天才的一步。既然我们每次 `find` 都要爬到根节点，那不如在爬的过程中，**顺手把沿途经过的节点直接挂到根节点下**。
这样，随着查询次数增多，整棵树会变得越来越扁平。

## 最终代码实现

这是结合了 **Weighted** 和 **Path Compression** 的最终版本。

```java
public class UnionFind {
    private int[] parent;
    private int[] size;

    // 初始化：每个节点都是一个独立的根，size 为 1
    public UnionFind(int n) {
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
            size[i] = 1;
        }
    }

    private void validate(int v1) {
        if (v1 < 0 || v1 >= parent.length) {
            throw new IllegalArgumentException("Index out of bounds");
        }
    }

    public int sizeOf(int v1) {
        validate(v1);
        return size[find(v1)];
    }

    // 核心：带路径压缩的 Find
    public int find(int v1) {
        validate(v1);
        if (v1 == parent[v1]) {
            return v1;
        }
        // 递归写法：在回溯时把沿途节点的 parent 全部改为 root
        parent[v1] = find(parent[v1]); 
        return parent[v1];
    }

    public boolean isConnected(int v1, int v2) {
        return find(v1) == find(v2);
    }

    // 核心：带权重的 Connect
    public void connect(int v1, int v2) {
        int rootP = find(v1);
        int rootQ = find(v2);

        if (rootP == rootQ) return;

        // 小树挂大树
        if (size[rootP] < size[rootQ]) {
            parent[rootP] = rootQ;
            size[rootQ] += size[rootP];
        } else {
            parent[rootQ] = rootP;
            size[rootP] += size[rootQ];
        }
    }
}