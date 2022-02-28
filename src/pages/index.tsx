// import { withSSRContext } from 'aws-amplify';
import Auth from '@aws-amplify/auth'
import API, { graphqlOperation, GraphQLResult } from '@aws-amplify/api'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { listTodos } from '../graphql/queries'
import { createTodo, updateTodo, deleteTodo } from '../graphql/mutations'
import { onCreateTodo, onUpdateTodo, onDeleteTodo } from '../graphql/subscriptions'
import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
// import { TodoType } from '../Types'
import styles from '../styles/pages/Home.module.scss'
import { ListTodosQuery, OnCreateTodoSubscription, OnUpdateTodoSubscription, OnDeleteTodoSubscription } from '../API'

type TodoType = {
  id: string,
  title: string,
  description?: string,
  isDone: boolean
}

type PropsType = {
  isAuthenticated: boolean,
  userId: string,
}

const Home: NextPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [userId, setUserId] = useState<string>('')
  const [todos, setTodos] = useState<TodoType[]>([])
  const [filter, setFilter] = useState<'All'|'Done'|'NotDone'>('All')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isVisibleNewItem, setIsVisibleNewItem] = useState<boolean>(false)
  const [navigateSeconds, setNavigateSeconds] = useState<number>(3)

  const router = useRouter()

  const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds))

  const navigateToProfile = async () => {
    await wait(1000)
    setNavigateSeconds(2)
    await wait(1000)
    setNavigateSeconds(1)
    await wait(1000)
    router.push('/profile')
  }

  const fetchUserAndData = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      const filterData = { filter: { id: { beginsWith: user.attributes.sub } } }
      const fetchedData = (await API.graphql(graphqlOperation(listTodos, filterData))) as GraphQLResult<ListTodosQuery>
      setIsAuthenticated(true)
      setUserId(user.attributes.sub)
      setTodos(fetchedData.data.listTodos.items.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()))
    } catch (err) {
      navigateToProfile()
    }
  }

  const attachSubscriptions = () => {
    const createClient = API.graphql(graphqlOperation(onCreateTodo))
    if ("subscribe" in createClient) {
      createClient.subscribe({
        next: (result: any) => {
          // const a: GraphQLResult<OnCreateTodoSubscription> = 0;
          setTodos((oldTodos) => [
            {...result.value.data.onCreateTodo},
            ...oldTodos
          ])
        }
      });
    }
    const updateClient = API.graphql(graphqlOperation(onUpdateTodo));
    if ("subscribe" in updateClient) {
      updateClient.subscribe({
        next: (result: any) => {
          setTodos((oldTodos) => [
            ...oldTodos.map((todo) => todo.id === result.value.data.onUpdateTodo.id ? result.value.data.onUpdateTodo : todo)
          ])
        }
      })
    }
    const deleteClient = API.graphql(graphqlOperation(onDeleteTodo));
    if ("subscribe" in deleteClient) {
      deleteClient.subscribe({
        next: (result: any) => {
          setTodos((oldTodos) => [
            ...oldTodos.filter((todo) => todo.id !== result.value.data.onDeleteTodo.id)
          ])
        }
      });
    }
  }

  useEffect(() => {
    fetchUserAndData()
    attachSubscriptions()
  }, [])

  const updateNewItemKeyDown = async (type: string, key: string) => {
    if (key === 'Enter') {
      if (type === 'title') {
        if (title !== '') {
          document.getElementById(`new_todo_description`).focus()
        }
      } else {
        createItem()
      }
      document.getElementById(`new_todo_${type}`).blur()
    }
  }

  const createItem = async () => {
    // MEMO: 使っているデータベースがNoSQLなのでuserIdで検索しやすいように
    const id = `${userId}=${Math.floor(Math.random() * Math.floor(99999999))}`
    const inputData = {
      input: {
        id,
        title,
        description,
        isDone: false
      }
    }
    try {
      setTitle('')
      setDescription('')
      setIsVisibleNewItem(false)
      await API.graphql(graphqlOperation(createTodo, inputData))
    } catch (err) {
      console.log(err)
    }
  }

  const updateItemClick = async (id: string, isDone: boolean) => {
    try {
      const inputData = {
        input: {
          id,
          isDone: !isDone
        }
      }
      await API.graphql(graphqlOperation(updateTodo, inputData))
    } catch (err) {
      console.log(err)
    }
  }

  const updateItemKeyDown = async (id: string, type: string, key: string, value: string) => {
    if (key === 'Enter') {
      if (value !== '') {
        try {
          const inputData = {
            input: {
              id,
              [type]: value
            }
          }
          await API.graphql(graphqlOperation(updateTodo, inputData))
        } catch (err) {
          console.log(err)
        }
      } else {
        document.getElementById(`${id}_${type}`).innerText = todos.find((todo) => todo.id === id)[type]
      }
      document.getElementById(`${id}_${type}`).blur()
    } else {
      return
    }
  }

  const deleteItem = async (id) => {
    const inputData = {
      input: {
        id
      }
    }
    try {
      await API.graphql(graphqlOperation(deleteTodo, inputData))
    } catch (err) {
      console.log(err)
    }
  }

  const filterdTodos = () => {
    switch (filter) {
      case 'Done':
        return todos.filter((todo) => todo.isDone === true)
      case 'NotDone':
        return todos.filter((todo) => todo.isDone === false)
      default:
        return todos
    }
  }

  return isAuthenticated ? (
    <div>
      <div className={styles.home_head}>
        <ul className={styles.filters}>
          <li className={`${styles.filter} ${filter === 'All' ? styles.filter_active : ''}`}>
            <button onClick={() => setFilter('All')}>All</button>
          </li>
          <li className={`${styles.filter} ${filter === 'Done' ? styles.filter_active : ''}`}>
            <button onClick={() => setFilter('Done')}>Done</button>
          </li>
          <li className={`${styles.filter} ${filter === 'NotDone' ? styles.filter_active : ''}`}>
            <button onClick={() => setFilter('NotDone')}>Not Done</button>
          </li>
        </ul>
        <button
          className={`${styles.new} ${isVisibleNewItem && styles.new__active}`} 
          onClick={() => {
            setFilter('All')
            setIsVisibleNewItem(!isVisibleNewItem)
          }}
        >
          {isVisibleNewItem ? '×' : '+ Create new todo'}
        </button>
      </div>
      <div className={styles.home_body}>
        <ul className={styles.todos}>
          {isVisibleNewItem && (
            <li className={styles.todo}>
              <div className={`${styles.todo_body} ${styles.todo_body__new}`}>
                <div className={styles.todo_body_title}>
                  <input
                    type="text"
                    id={`new_todo_title`}
                    placeholder="Enter the title"
                    value={title}
                    onChange={(eve) => setTitle(eve.target.value)}
                    onKeyDown={(eve) => updateNewItemKeyDown('title', eve.key)}
                  />
                </div>
                <div className={styles.todo_body_description}>
                  <input
                    type="text"
                    id={`new_todo_description`}
                    placeholder="Enter the description"
                    value={description}
                    onChange={(eve) => setDescription(eve.target.value)}
                    onKeyDown={(eve) => updateNewItemKeyDown('description', eve.key)}
                  />
                </div>
              </div>
            </li>
          )}
          {filterdTodos().map((todo) => (
            <li key={todo.id} className={styles.todo}>
              <div className={styles.todo_head}>
                <button
                  className={`${styles.todo_head_isdone} ${todo.isDone && styles.todo_head_isdone_active}`}
                  onClick={() => updateItemClick(todo.id, todo.isDone)}
                ></button>
                <button
                  className={styles.todo_head_button}
                  onClick={() => deleteItem(todo.id)}
                ></button>
              </div>
              <div className={styles.todo_body}>
                <div className={styles.todo_body_title}>
                  <input type="text" id={`${todo.id}_title`} defaultValue={todo.title} onKeyDown={(eve) => updateItemKeyDown(todo.id, 'title', eve.key, eve.currentTarget.value)}/>
                </div>
                <div className={styles.todo_body_description}>
                  <input type="text" id={`${todo.id}_description`} defaultValue={todo.description} onKeyDown={(eve) => updateItemKeyDown(todo.id, 'description', eve.key, eve.currentTarget.value)}/>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  ) : (
    <div>
      <p className={styles.text}>Sign in is required.</p>
      <p className={styles.text}><span className={styles.text__bold}>{navigateSeconds}</span> seconds later you will be on your way.</p>
    </div>
  )
}

export default Home