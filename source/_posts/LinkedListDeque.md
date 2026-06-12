---
title: 双向链表 LinkedListDeque
tags: [Java, 数据结构]
categories: [数据结构与算法]
sticky: 0
date: 2026-02-12 20:35:31
updated: 2026-02-12 20:35:31
expires:
keywords:
excerpt: 基于链表的双端队列。拥有迭代与递归两种获取元素的方式，并实现了 O(1) 的首尾操作。
top_img:
thumbnail:
cover: https://img.099115.xyz/img/20260212195234.png
---

Project 1A中要求实现一个双端队列（Deque）。相比于数组实现（ArrayDeque），链表实现的难点在于指针的管理。

为了避免在 `addFirst` 或 `removeLast` 时频繁处理 `null` 指针异常，我采用了 **Circular Sentinel Topology**（循环哨兵拓扑结构）。

![20260212195234](https://img.099115.xyz/img/20260212195234.png)

## 核心设计：循环哨兵 (Circular Sentinel)

在这个设计中，我们保持一个始终存在的 `sentinel` 节点：

- **空链表**：`sentinel.next` 和 `sentinel.prev` 都指向 `sentinel` 自己。
- **非空链表**：
  - `sentinel.next` 指向真正的头节点 (First)。
  - `sentinel.prev` 指向真正的尾节点 (Last)。
  - 尾节点的 `next` 指回 `sentinel`，形成闭环。

这种设计的最大好处是：**不需要为头尾操作编写特殊的条件判断**，所有的增删操作都可以统一为通用的指针修改。

## 复杂度分析

| 操作                         | 复杂度 | 说明                         |
| :--------------------------- | :----- | :--------------------------- |
| `addFirst` / `addLast`       | O(1)   | 仅需修改 4 个指针引用        |
| `removeFirst` / `removeLast` | O(1)   | 仅需修改 2 个指针引用        |
| `get`                        | O(N)   | 需要遍历链表                 |
| `size`                       | O(1)   | 维护了 `size` 变量，无需遍历 |

## 代码实现

### 0.创建文件

{% notel default fa-info 项目需求 %}
首先创建一个名为 `LinkedListDeque61B` 的文件。该文件应创建在 `proj1a/src` 目录中。为此，右键单击 `src` 目录，导航至“新建 -> Java 类”，并将其命名为 `LinkedListDeque61B` 。

我们希望 `LinkedListDeque61B` 能够存储多种不同类型的数据。例如， `LinkedListDeque61B<String>` 可以存储 `String` 和 `LinkedListDeque61B<Integer>` 存储 `Integer` 。要启用此功能，应该编辑类的声明，使其如下所示：

```java
public class LinkedListDeque61B<T>
```

使用 `T` 或其他字符串（例如 `LinkedListDeque61B<Glerp>` 实际上无关紧要。但是，为了与其他 Java 代码保持一致，建议使用 `<T>` 。

还需要告诉 Java，每个 `LinkedListDeque61B` 都是一个 `Deque61B` ，以便用户可以编写类似 `Deque61B<String> lld1 = new LinkedListDeque61B<>();` 的代码。要实现这一点，请将类的声明更改为：

```java
public class LinkedListDeque61B<T> implements Deque61B<T>
```

然而，这会产生错误。为了使 `LinkedListDeque61B` 成为一个 `Deque61B` 需要实现所有 `Deque61B` 方法。不过，当错误信息框弹出时，将鼠标悬停在红色波浪线上，然后点击“实现方法”按钮。这将自动生成方法头。

下面这个 GIF 动画演示了这些步骤：
![20260212200547](https://img.099115.xyz/img/20260212200547.png)

最后，应该创建一个空构造函数。

```java
public LinkedListDeque61B() {
}
```

现在可以开始了！
{% endnotel %}

### 1. 节点定义与构造函数

内部类 `Node` 定义了双向指针。构造函数初始化一个指向自己的哨兵节点。

```java
public class LinkedListDeque61B<T> implements Deque61B<T> {

    public class Node {
        private T item;
        private Node prev;
        private Node next;

        public Node(T item, Node prev, Node next) {
            this.item = item;
            this.prev = prev;
            this.next = next;
        }
    }

    private Node sentinel;
    private int size;

    public LinkedListDeque61B() {
        sentinel = new Node(null, null, null);
        sentinel.prev = sentinel;
        sentinel.next = sentinel;
        size = 0;
    }
```

### 2. 编写和验证 `addFirst` 和 `addLast`

{% notel default fa-info 项目需求 %}
`addFirst` 和 `addLast` 不能使用循环或递归。单个添加操作的时间复杂度必须为“常数时间”，也就是说，无论双端队列有多大，添加一个元素所需的时间都应该大致相同。这意味着你不能使用遍历双端队列中所有或大部分元素的循环。
{% endnotel %}

得益于循环结构，`addFirst` 和 `addLast` 的逻辑非常对称。以 `addLast` 为例，我们只需要找到 `sentinel.prev`（即旧的尾节点）进行挂载即可。

```java
    @Override
    public void addFirst(T x) {
        Node oldFirst = sentinel.next;
        Node newNode = new Node(x, sentinel, oldFirst);
        oldFirst.prev = newNode;
        sentinel.next = newNode;
        size += 1;
    }

    @Override
    public void addLast(T x) {
        Node oldLast = sentinel.prev;
        Node newNode = new Node(x, sentinel.prev, sentinel);
        oldLast.next = newNode;
        sentinel.prev = newNode;
        size += 1;
    }
```

### 3. 编写和验证 `toList`

{% notel default fa-info 项目需求 %}
使用调试器和可视化工具来验证 `addFirst` 和 `addLast` 方法的正确性有点繁琐且令人不快。此外，这种手动验证方式还有一个问题：一旦你修改了代码，它就失效了。想象一下，你对 ` addLast 方法做了一些细微但不确定的改动。为了验证你没有破坏任何东西，你不得不重新执行整个验证过程。真是太麻烦了。

我们真正需要的是一些自动化测试。但遗憾的是，如果我们只实现了 `addFirst` 和 `addLast` 这两个方法，就没有简单的方法来验证它们的正确性。也就是说，目前我们无法遍历列表并获取其值，然后检查这些值是否正确。

这时就需要用到 `toList` 方法了。调用此方法时，它会返回一个列表。 `Deque61B` 的 `List` 表示。例如，如果 `Deque61B` 调用 `addLast(5)` 、 `addLast(9)` 、 `addLast(10)` ，然后调用 `addFirst(3)` ，那么 `toList()` 的结果应该是一个 List ，前面是 3，然后是 5，然后是 9，然后是 10。如果用 Java 打印，它会显示为 `[3, 5, 9, 10]` 。

编写 `toLis`t 方法。该方法的第一行应该类似于 `List<T> returnList = new ArrayList<>();`
{% endnotel %}

将链表转换为 Java 自带的 `List` 方便调试和测试。

```java
    @Override
    public List<T> toList() {
        List<T> returnList = new ArrayList<>();
        Node curr = sentinel.next;
        while (curr != sentinel) {
            returnList.add(curr.item);
            curr = curr.next;
        }
        return returnList;
    }
```

### 4. `isEmpty` 和 `size`

{% notel default fa-info 项目需求 %}
这两种方法必须耗时恒定 。也就是说，任一方法的执行时间都不应取决于双端队列中元素的数量。
{% endnotel %}

既然我们已经跟踪大小使用 `size` ，那么直接使用 `size` 判断是否为空和返回大小即可。

```java
@Override
    public boolean isEmpty() {
        return size == 0;
    }

    @Override
    public int size() {
        return size;
    }
}
```

### 5. `get` 和 `getRecursive`

{% notel default fa-info 项目需求 %}
接收到无效参数，例如当 Deque61B 队列只有 1 个元素时 get(28723) ，或者接收到负索引。在这些情况下， `get` 应该返回 `null` 。`get` 过程必须使用迭代。
{% endnotel %}

由于我们正在处理链表，因此编写递归 get 方法 `getRecursive` 会很有趣。

Project 要求同时实现迭代 (`get`) 和递归 (`getRecursive`) 两种方式。

- **迭代**：使用 `while` 循环移动指针。
- **递归**：利用辅助函数 `getRecursiveHelper`，每次 `index - 1` 并移动到 `next` 节点。

```java
    @Override
    public T get(int index) {
        if (index > size - 1 || index < 0) {
            return null;
        }

        int num = 0;
        Node curr = sentinel.next;

        while (num != index) {
            curr = curr.next;
            num += 1;
        }
        return curr.item;
    }

    @Override
    public T getRecursive(int index) {
        if (index < 0 || index >= size) {
            return null;
        }
        return getRecursiveHelper(sentinel.next, index);
    }

    private T getRecursiveHelper(Node p, int index) {
        if (index == 0) {
            return p.item;
        } else {
            return getRecursiveHelper(p.next, index - 1);
        }
    }
```

### 6. `removeFirst` 和 `removeLast`

{% notel default fa-info 项目需求 %}
不要保留对已从双端队列中移除的元素的引用。程序在任何给定时间点使用的内存量必须与元素的数量成正比。例如，如果您向双端队列中添加 10,000 个元素，然后移除 9,999 个元素，则最终的内存使用量应为包含 1 个元素的双端队列，而不是 10,000 个元素。请记住，Java 垃圾回收器仅在不存在指向该对象的指针时才会“删除”对象。

如果 `Deque61B` 为空，则删除操作应返回 `null` 。

`removeFirst` 和 `removeLast` 不能使用循环或递归。与 `addFirst` 和 `addLast` 一样，这些操作必须具有“常数时间”。请参阅关于编写 `addFirst` 和 `addLast` 部分。
{% endnotel %}

删除操作同样需要处理指针。注意在删除前检查 `isEmpty()`，避免删除哨兵节点本身。

```java
    @Override
    public T removeFirst() {
        if (this.isEmpty()) {
            return null;
        }

        Node oldFirst = sentinel.next;
        sentinel.next = oldFirst.next;
        oldFirst.next.prev = sentinel;
        size -= 1;
        return oldFirst.item;
    }

    @Override
    public T removeLast() {
        if (this.isEmpty()) {
            return null;
        }

        Node oldLast = sentinel.prev;
        sentinel.prev = oldLast.prev;
        oldLast.prev.next = sentinel;
        size -= 1;
        return oldLast.item;
    }
```

### 7. 测试组件

{% notel default fa-info 项目需求 %}
为了编写测试，我们将使用 Google 的 [Truth](https://truth.dev/) 断言库。使用此库而不是 JUnit 断言的原因如下：

- 改进列表的错误信息。
- 更容易阅读和编写测试题。
- 开箱即用的大型断言库。
  经常使用 Arrange-Act-Assert 模式编写测试：

1. 安排测试用例，例如实例化数据结构或用元素填充数据结构。
2. 通过执行你想要测试的行为来进行测试。
3. 断言 （2）中行动的结果。
   为了减少样板（重复）代码的数量，通常会在单个测试方法中包含多个“执行”和“断言”步骤。

你应该在 `LinkedListDeque61BTest.java` 中编写你的测试。

> 真理断言

真理断言采用以下格式：

```java
assertThat(actual).isEqualTo(expected);
```

要向断言中添加消息，可以改用：

```java
assertWithMessage("actual is not expected")
    .that(actual)
    .isEqualTo(expected);
```

可以使用除 `isEqualTo` 之外的其他方法，具体取决于 `actual` 的类型。例如，如果 `actual` 是一个 `List` ，可以执行以下操作来检查其内容，而无需创建一个新的 `List` ：

```java
assertThat(actualList)
    .containsExactly(0, 1, 2, 3)
    .inOrder();
```

如果有一个 List 或其他引用对象，可以使用：

```java
assertThat(actualList)
    .containsExactlyElementsIn(expected)  // `expected` is a List
    .inOrder();
```

真理包含许多断言，包括 `isNull` 和 `isNotNull` ；以及 `isTrue` 和 `isFalse` 用于 `boolea`n 值。IntelliJ 的自动完成功能通常会给出建议，告诉你可以使用哪个断言。

> 示例测试

让我们来分析一下提供的 addLastTestBasic 函数：

```java
@Test
/** In this test, we use only one assertThat statement.
    *  Sometimes, the tedious work of adding the extra assertion statements isn't worth it. */
public void addLastTestBasic() {
    Deque61B<String> lld1 = new LinkedListDeque61B<>();

    lld1.addLast("front"); // after this call we expect: ["front"]
    lld1.addLast("middle"); // after this call we expect: ["front", "middle"]
    lld1.addLast("back"); // after this call we expect: ["front", "middle", "back"]
    assertThat(lld1.toList()).containsExactly("front", "middle", "back").inOrder();
}
```

`@Test` 告诉 Java 这是一个测试方法，应该在运行测试时运行。
排列 ：我们构造一个新的 Deque61B ，并向其中添加 3 个元素。 addLast 。
操作 ：我们对 Deque61B 调用 toList 方法。这隐式地依赖于之前的 addLast 调用。
断言 ：我们使用真值断言来检查 toList 是否包含特定顺序的特定元素。

{% endnotel %}

## 总结

通过引入哨兵节点，我们成功消除了一般链表实现中对于“头节点为空”或“尾节点为空”的特殊判断。这种以空间换逻辑简洁性的做法，在底层数据结构设计中非常常见。
