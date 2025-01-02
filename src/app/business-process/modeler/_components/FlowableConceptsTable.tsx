import React from 'react'

export const FlowableConceptsTable = () => {
  const concepts = [
    {
      concept: 'User Task',
      description: `A user task represents an activity that requires user intervention. It involves a point in the process where the user needs to take action, such as filling out a form or approving a decision.`,
    },
    {
      concept: 'Service Task',
      description: `A service task is an automated activity executed by a system or external application. It requires no user interaction and is often used for operations like sending an email or calling an API.`,
    },
    {
      concept: 'Start Event',
      description: `A start event marks the entry point of a process. It triggers process execution and can be initiated manually, by an external event, or by another process.`,
    },
    {
      concept: 'End Event',
      description: `An end event marks the completion of a process or process branch. Once reached, the process terminates, and associated resources are released.`,
    },
    {
      concept: 'Exclusive Gateway (XOR)',
      description: `An exclusive gateway allows the process to make a decision based on conditions. It routes execution to only one path among multiple options, depending on the specified condition.`,
    },
    {
      concept: 'Parallel Gateway (AND)',
      description: `A parallel gateway splits the process execution into multiple parallel branches. All branches are executed simultaneously, and the process continues after all branches are completed.`,
    },
    {
      concept: 'Inclusive Gateway (OR)',
      description: `An inclusive gateway directs the process flow to one or more branches based on specific conditions. Unlike the exclusive gateway, it can route to multiple paths simultaneously.`,
    },
    {
      concept: 'Decision Table',
      description: `A decision table is a graphical model representing business rules in a tabular format. Rows represent rules, and columns represent input conditions (criteria) and output actions (results). Decision tables simplify complex conditional logic without detailed coding. Flowable's DMN engine integrates decision tables into BPMN processes, enabling automated decisions during execution.`,
    },
    {
      concept: 'Message Center Task',
      description: `The message center task allows users to send messages to other processes or external systems. It dynamically retrieves the list of supported channels and available templates, enhancing the functionality and security of the BPMN modeler.`,
    },
  ]

  return (
    <div>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 dark:bg-zinc-800">
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
              Task
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {concepts.map((item, index) => (
            <tr
              key={index}
              className={`${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-100 dark:bg-zinc-800'}`}
            >
              <td className="border border-gray-300 px-4 py-2 font-medium">
                {item.concept}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
